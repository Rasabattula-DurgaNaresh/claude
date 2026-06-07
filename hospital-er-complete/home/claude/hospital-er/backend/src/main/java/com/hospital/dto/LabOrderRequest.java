package com.hospital.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class LabOrderRequest {
    @NotNull                           private Long   admissionId;
    @NotEmpty                          private List<String> testTypes;
    private String                     priority = "ROUTINE";
    private String                     orderedBy;
}