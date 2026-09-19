package com.agricare;

import com.agricare.dto.LogisticsRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LogisticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetLogisticsProviders() throws Exception {
        mockMvc.perform(get("/api/logistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void testCreateLogisticsBooking() throws Exception {
        LogisticsRequestDto dto = LogisticsRequestDto.builder()
                .farmerId(1L)
                .pickupLocation("Tenali Farmgate")
                .destination("ABC Cold Storage, Guntur")
                .crop("Tomato")
                .quantity(500.0)
                .estimatedCost(1200.0)
                .farmerPhone("9876543210")
                .build();

        mockMvc.perform(post("/api/logistics/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.referenceNumber").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }
}
