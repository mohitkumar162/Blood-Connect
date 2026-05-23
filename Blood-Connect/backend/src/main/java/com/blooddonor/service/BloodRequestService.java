package com.blooddonor.service;

import com.blooddonor.model.dto.BloodRequestDto;
import com.blooddonor.model.dto.DonorResponseDto;
import com.blooddonor.model.entity.*;
import com.blooddonor.notification.NotificationService;
import com.blooddonor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final DonorResponseRepository responseRepository;
    private final DonationRepository donationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public BloodRequestDto.Response createRequest(String requesterEmail, BloodRequestDto.CreateRequest dto) {
        User requester = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        BloodRequest request = BloodRequest.builder()
            .requester(requester)
            .patientName(dto.getPatientName())
            .bloodGroup(dto.getBloodGroup())
            .units(dto.getUnits())
            .hospital(dto.getHospital())
            .city(dto.getCity())
            .latitude(dto.getLatitude())
            .longitude(dto.getLongitude())
            .urgency(dto.getUrgency() != null ? dto.getUrgency() : Urgency.HIGH)
            .requiredBy(dto.getRequiredBy())
            .notes(dto.getNotes())
            .status(RequestStatus.PENDING)
            .build();

        request = requestRepository.save(request);

        BloodRequestDto.Response response = BloodRequestDto.Response.from(request);
        messagingTemplate.convertAndSend("/topic/requests", response);

        notifyMatchingDonors(request);

        return response;
    }

    private void notifyMatchingDonors(BloodRequest request) {
        List<User> matchingDonors = userRepository
            .findByRoleAndBloodGroupAndAvailableTrue(Role.DONOR, request.getBloodGroup());

        log.info("Notifying {} matching donors for request {}", matchingDonors.size(), request.getId());

        matchingDonors.forEach(donor -> {
            try {
                notificationService.sendPushNotification(
                    donor,
                    "Urgent: Blood Needed",
                    String.format("Patient needs %s blood at %s, %s",
                        request.getBloodGroup(), request.getHospital(), request.getCity())
                );
                notificationService.sendEmail(
                    donor.getEmail(),
                    "Urgent Blood Request - BloodConnect",
                    buildEmailBody(request, donor)
                );
            } catch (Exception e) {
                log.warn("Failed to notify donor {}: {}", donor.getId(), e.getMessage());
            }
        });
    }

    private String buildEmailBody(BloodRequest req, User donor) {
        return String.format("""
            Dear %s,

            A patient urgently needs %s blood at %s, %s.

            Patient: %s
            Units: %d
            Urgency: %s
            %s

            Please log in to BloodConnect to respond:
            %s/requests/%d

            Thank you for saving lives!
            BloodConnect Team
            """,
            donor.getName(), req.getBloodGroup(), req.getHospital(), req.getCity(),
            req.getPatientName(), req.getUnits(), req.getUrgency(),
            req.getNotes() != null ? "Notes: " + req.getNotes() : "",
            frontendUrl, req.getId()
        );
    }

    public List<BloodRequestDto.Response> getActiveRequests() {
        return requestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.PENDING)
            .stream().map(BloodRequestDto.Response::from).collect(Collectors.toList());
    }

    public List<BloodRequestDto.Response> getAllRequests(String statusStr, String bloodGroup) {
        RequestStatus status = null;
        if (statusStr != null && !statusStr.isBlank()) {
            try { status = RequestStatus.valueOf(statusStr); } catch (Exception ignored) {}
        }
        return requestRepository.findWithFilters(status, bloodGroup.isBlank() ? null : bloodGroup)
            .stream().map(BloodRequestDto.Response::from).collect(Collectors.toList());
    }

    public BloodRequestDto.Response getById(Long id) {
        return BloodRequestDto.Response.from(
            requestRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"))
        );
    }

    public List<BloodRequestDto.Response> getMyRequests(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findByRequesterOrderByCreatedAtDesc(user)
            .stream().map(BloodRequestDto.Response::from).collect(Collectors.toList());
    }

    @Transactional
    public DonorResponseDto respondToRequest(Long requestId, String donorEmail, String action, String message) {
        BloodRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        User donor = userRepository.findByEmail(donorEmail)
            .orElseThrow(() -> new RuntimeException("Donor not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is no longer active");
        }

        DonorResponse resp = responseRepository.findByBloodRequestAndDonor(request, donor)
            .orElse(DonorResponse.builder().bloodRequest(request).donor(donor).build());

        ResponseStatus status = "ACCEPT".equalsIgnoreCase(action)
            ? ResponseStatus.ACCEPTED : ResponseStatus.DECLINED;
        resp.setStatus(status);
        resp.setMessage(message);
        resp = responseRepository.save(resp);

        if (status == ResponseStatus.ACCEPTED) {
            request.setStatus(RequestStatus.ACCEPTED);
            requestRepository.save(request);

            Donation donation = Donation.builder()
                .donor(donor)
                .bloodRequest(request)
                .patientName(request.getPatientName())
                .bloodGroup(request.getBloodGroup())
                .hospital(request.getHospital())
                .city(request.getCity())
                .build();
            donationRepository.save(donation);

            donor.setLastDonationDate(LocalDateTime.now());
            donor.setTotalDonations(donor.getTotalDonations() + 1);
            userRepository.save(donor);

            notificationService.sendEmail(
                request.getRequester().getEmail(),
                "Donor Found! - BloodConnect",
                String.format("Great news! %s has accepted your blood request for %s. Contact: %s",
                    donor.getName(), request.getBloodGroup(), donor.getPhone())
            );
        }

        BloodRequestDto.Response updated = BloodRequestDto.Response.from(
            requestRepository.findById(requestId).get()
        );
        messagingTemplate.convertAndSend("/topic/requests/" + requestId, updated);

        return DonorResponseDto.from(resp);
    }

    @Transactional
    public BloodRequestDto.Response closeRequest(Long id, String email) {
        BloodRequest request = requestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!request.getRequester().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        request.setStatus(RequestStatus.CLOSED);
        return BloodRequestDto.Response.from(requestRepository.save(request));
    }
}
