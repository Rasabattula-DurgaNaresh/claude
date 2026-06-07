package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="ER_BEDS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bed {
    @Id @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="seq_bed")
    @SequenceGenerator(name="seq_bed", sequenceName="SEQ_BEDS", allocationSize=1)
    @Column(name="BED_ID")         private Long   bedId;
    @Column(name="BED_NUMBER")     private String bedNumber;
    @Column(name="WARD")           private String ward;
    @Column(name="STATUS")         private String status;
    @Column(name="PATIENT_ID")     private Long   patientId;
    @Column(name="ASSIGNED_AT")    private LocalDateTime assignedAt;
    @Column(name="EQUIPMENT_FLAGS") private String equipmentFlags;
    @Column(name="FLOOR_NUMBER")   private Integer floorNumber;
    @Column(name="CREATED_AT")     private LocalDateTime createdAt;
}