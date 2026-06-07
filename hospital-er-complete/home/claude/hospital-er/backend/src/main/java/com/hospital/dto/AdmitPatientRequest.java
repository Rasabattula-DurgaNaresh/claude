package com.hospital.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AdmitPatientRequest {
    @NotBlank                          private String mrn;
    @NotBlank                          private String fullName;
    @Past                              private LocalDate dateOfBirth;
    @NotBlank                          private String gender;
    private String bloodType;
    private String contactPhone;
    private String allergies;
    private String chronicConditions;
    @NotBlank                          private String chiefComplaint;
    @Min(1) @Max(5)                    private int    triageLevel;
}