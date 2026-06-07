package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="ER_DOCTORS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_dr")
    @SequenceGenerator(name="seq_dr", sequenceName="SEQ_DOCTORS", allocationSize=1)
    @Column(name="DOCTOR_ID")      private Long   doctorId;
    @Column(name="STAFF_ID")       private String staffId;
    @Column(name="FULL_NAME")      private String fullName;
    @Column(name="SPECIALIZATION") private String specialization;
    @Column(name="SHIFT")          private String shift;
    @Column(name="STATUS")         private String status;
    @Column(name="MAX_PATIENTS")   private Integer maxPatients;
    @Column(name="CURRENT_LOAD")   private Integer currentLoad;
    @Column(name="YEARS_EXPERIENCE") private Integer yearsExperience;
    @Column(name="CREATED_AT")     private LocalDateTime createdAt;
}