package com.hospital.dto;

import lombok.Data;

@Data
public class VitalSignRequest {
    private Long   admissionId;
    private Double heartRate;
    private Double bpSystolic;
    private Double bpDiastolic;
    private Double temperature;
    private Double oxygenSat;
    private Double respRate;
    private Integer painScale;
    private Integer gcsScore;
    private String  recordedBy;
}