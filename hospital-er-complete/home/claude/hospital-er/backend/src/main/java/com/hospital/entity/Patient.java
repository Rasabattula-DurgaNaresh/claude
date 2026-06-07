package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="ER_PATIENTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_pat")
    @SequenceGenerator(name="seq_pat", sequenceName="SEQ_PATIENTS", allocationSize=1)
    @Column(name="PATIENT_ID")     private Long   patientId;
    @Column(name="MRN")            private String mrn;
    @Column(name="FULL_NAME")      private String fullName;
    @Column(name="DATE_OF_BIRTH")  private LocalDate dateOfBirth;
    @Column(name="GENDER")         private String gender;
    @Column(name="BLOOD_TYPE")     private String bloodType;
    @Column(name="CONTACT_PHONE")  private String contactPhone;
    @Column(name="EMERGENCY_CONTACT") private String emergencyContact;
    @Column(name="ALLERGIES")      private String allergies;
    @Column(name="CHRONIC_CONDITIONS") private String chronicConditions;
    @Column(name="INSURANCE_ID")   private String insuranceId;
    @Column(name="CREATED_AT")     private LocalDateTime createdAt;
}