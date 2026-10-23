package com.grash.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grash.dto.BrandConfig;
import com.grash.dto.license.LicenseEntitlement;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BrandingService {

    private final ObjectMapper objectMapper;
    private final LicenseService licenseService;
    @Value("${white-labeling.custom-colors:#{null}}")
    private String customColors;
    @Value("${white-labeling.brand-config:#{null}}")
    private String brandRawConfig;

    public String getMailBackgroundColor() {
        String backgroundColor = "#5569ff";
        if (customColors != null && !customColors.isEmpty()) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                JsonNode node = mapper.readTree(customColors);
                backgroundColor = node.get("emailColors").asText();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return backgroundColor;
    }

    public static final String BRAND_NAME_AR = "شركة المرجان الوقائية";
    public static final String BRAND_NAME_EN = "Al Murjan Preventive Company";

    public BrandConfig getBrandConfig() {
        return getBrandConfig(null);
    }

    /** Arabic brand name for Arabic (or unknown) locales, English otherwise. */
    public BrandConfig getBrandConfig(java.util.Locale locale) {
        boolean english = locale != null && !"ar".equalsIgnoreCase(locale.getLanguage());
        BrandConfig defaultConfig = BrandConfig.builder()
                .name(english ? BRAND_NAME_EN : BRAND_NAME_AR)
                .shortName(english ? "Al Murjan" : "المرجان")
                .website("")
                .mail("")
                .phone("")
                .addressStreet("")
                .addressCity(english ? "Saudi Arabia" : "المملكة العربية السعودية")
                .build();
        if (!licenseService.hasEntitlement(LicenseEntitlement.BRANDING)) return defaultConfig;
        if (brandRawConfig == null || brandRawConfig.isEmpty()) {
            return defaultConfig;
        } else {
            try {
                return objectMapper.readValue(brandRawConfig, BrandConfig.class);
            } catch (Exception e) {
                return defaultConfig;
            }
        }
    }
}
