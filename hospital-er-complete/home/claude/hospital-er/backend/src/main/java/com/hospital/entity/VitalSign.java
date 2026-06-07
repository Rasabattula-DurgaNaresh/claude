package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="VITAL_SIGNS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VitalSign {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_vs")
    @SequenceGenerator(name="seq_vs", sequenceName="SEQ_VITALS", allocationSize=1)
    @Column(name="VITAL_ID")       private Long   vitalId;
    @Column(name="ADMISSION_ID")   private Long   admissionId;
    @Column(name="PATIENT_ID")     private Long   patientId;
    @Column(name="HEART_RATE")     private Double heartRate;
    @Column(name="BLOOD_PRESSURE_S") private Double bpSystolic;
    @Column(name="BLOOD_PRESSURE_D") private Double bpDiastolic;
    @Column(name="TEMPERATURE")    private Double temperature;
    @Column(name="OXYGEN_SAT")     private Double oxygenSat;
    @Column(name="RESP_RATE")      private Double respRate;
    @Column(name="PAIN_SCALE")     private Integer painScale;
    @Column(name="GCS_SCORE")      private Integer gcsScore;
    @Column(name="IS_CRITICAL")    private Integer isCritical;
    @Column(name="RECORDED_BY")    private String recordedBy;
    @Column(name="RECORDED_AT")    private LocalDateTime recordedAt;
}