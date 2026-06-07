package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="LAB_ORDERS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LabOrder {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_lab")
    @SequenceGenerator(name="seq_lab", sequenceName="SEQ_LAB_ORDERS", allocationSize=1)
    @Column(name="LAB_ORDER_ID")   private Long   labOrderId;
    @Column(name="ORDER_REF")      private String orderRef;
    @Column(name="ADMISSION_ID")   private Long   admissionId;
    @Column(name="PATIENT_ID")     private Long   patientId;
    @Column(name="TEST_TYPE")      private String testType;
    @Column(name="PRIORITY")       private String priority;
    @Column(name="STATUS")         private String status;
    @Column(name="RESULT_VALUE")   private String resultValue;
    @Column(name="RESULT_FLAG")    private String resultFlag;
    @Column(name="ORDERED_BY")     private String orderedBy;
    @Column(name="ORDERED_AT")     private LocalDateTime orderedAt;
    @Column(name="COMPLETED_AT")   private LocalDateTime completedAt;
    @Column(name="TURNAROUND_MINS") private Integer turnaroundMins;
    @Column(name="PROCESSING_THREAD") private String processingThread;
}