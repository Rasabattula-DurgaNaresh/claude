package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="ER_ADMISSIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Admission {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_adm")
    @SequenceGenerator(name="seq_adm", sequenceName="SEQ_ADMISSIONS", allocationSize=1)
    @Column(name="ADMISSION_ID")       private Long   admissionId;
    @Column(name="ADMISSION_REF")      private String admissionRef;
    @Column(name="PATIENT_ID")         private Long   patientId;
    @Column(name="CHIEF_COMPLAINT")    private String chiefComplaint;
    @Column(name="TRIAGE_LEVEL")       private Integer triageLevel;
    @Column(name="TRIAGE_SCORE")       private Double  triageScore;
    @Column(name="STATUS")             private String  status;
    @Column(name="ASSIGNED_DOCTOR_ID") private Long   assignedDoctorId;
    @Column(name="BED_ID")             private Long   bedId;
    @Column(name="ARRIVAL_TIME")       private LocalDateTime arrivalTime;
    @Column(name="TRIAGE_TIME")        private LocalDateTime triageTime;
    @Column(name="DOCTOR_ASSIGNED_AT") private LocalDateTime doctorAssignedAt;
    @Column(name="BED_ASSIGNED_AT")    private LocalDateTime bedAssignedAt;
    @Column(name="TREATMENT_STARTED_AT") private LocalDateTime treatmentStartedAt;
    @Column(name="DISCHARGED_AT")      private LocalDateTime dischargedAt;
    @Column(name="DIAGNOSIS")          private String  diagnosis;
    @Column(name="DISCHARGE_TYPE")     private String  dischargeType;
    @Column(name="PRIORITY_QUEUE_POS") private Integer priorityQueuePos;
    @Column(name="PROCESSING_THREAD")  private String  processingThread;
    @Column(name="UPDATED_AT")         private LocalDateTime updatedAt;
    @Column(name="CREATED_AT")         private LocalDateTime createdAt;
}