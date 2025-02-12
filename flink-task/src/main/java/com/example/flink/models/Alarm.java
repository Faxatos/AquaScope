package com.example.flink.models;

import java.io.Serializable;
import java.time.Instant;

/**
 * Model class for an Alarm.
 */
public class Alarm implements Serializable {
    private String alarmId;
    private long mmsi;
    private Instant timestamp; 
    private String code;
    private String description;
    private String status;

    // No-argument constructor is required for (de)serialization.
    public Alarm() {}

    public Alarm(String alarmId, long mmsi, Instant timestamp, String code, String description, String status) {
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

    public Instant getTimestamp() {
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