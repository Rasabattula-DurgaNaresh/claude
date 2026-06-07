package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="ER_ALERTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alert {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_al")
    @SequenceGenerator(name="seq_al", sequenceName="SEQ_ALERTS", allocationSize=1)
    @Column(name="ALERT_ID")       private Long   alertId;
    @Column(name="ADMISSION_ID")   private Long   admissionId;
    @Column(name="PATIENT_ID")     private Long   patientId;
    @Column(name="ALERT_TYPE")     private String alertType;
    @Column(name="SEVERITY")       private String severity;
    @Column(name="MESSAGE")        private String message;
    @Column(name="IS_ACKNOWLEDGED") private Integer isAcknowledged;
    @Column(name="ACKNOWLEDGED_BY") private String acknowledgedBy;
    @Column(name="ACKNOWLEDGED_AT") private LocalDateTime acknowledgedAt;
    @Column(name="AUTO_RESOLVED")  private Integer autoResolved;
    @Column(name="TRIGGERED_BY")   private String triggeredBy;
    @Column(name="CREATED_AT")     private LocalDateTime createdAt;
}