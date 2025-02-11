package com.example.flink.models;

import java.io.Serializable;

/**
 * Model class for an Alarm.
 */
public class Alarm implements Serializable {
    private String alarmId;
    private long mmsi;
    private String timestamp; // ISO–8601 string (e.g., "2025-01-01T10:00:00Z")
    private String code;
    private String description;
    private String status;

    // No-argument constructor is required for (de)serialization.
    public Alarm() {}

    public Alarm(String alarmId, long mmsi, String timestamp, String code, String description, String status) {
        this.alarmId = alarmId;
        this.mmsi = mmsi;
        this.timestamp = timestamp;
        this.code = code;
        this.description = description;
        this.status = status;
    }

    // Getters and setters.
    public String getAlarmId() {
        return alarmId;
    }

    public long getMmsi() {
        return mmsi;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    @Override
    public String toString() {
        return "Alarm{" +
                "alarmId='" + alarmId + '\'' +
                ", mmsi=" + mmsi +
                ", timestamp='" + timestamp + '\'' +
                ", code='" + code + '\'' +
                ", description='" + description + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}