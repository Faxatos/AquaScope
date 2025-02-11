package com.example.flink.models;

/**
 * The VesselTracking POJO holds the key data extracted from the first and latest logs:
 * - For a new MMSI it stores:
 *      * latSource, lonSource, creationTimestamp, destLat, destLon, etaAis (all from the first log)
 * - And for every log it updates:
 *      * currentLat, currentLon, latestLogTimestamp (from the current log)
 */

public static class VesselTracking {
    private long mmsi;
    private double latSource;
    private double lonSource;
    private String creationTimestamp;
    private double currentLat;
    private double currentLon;
    private String latestLogTimestamp;
    private double destLat;
    private double destLon;
    private String etaAis;

    public VesselTracking(long mmsi,
                            double latSource,
                            double lonSource,
                            String creationTimestamp,
                            double currentLat,
                            double currentLon,
                            String latestLogTimestamp,
                            double destLat,
                            double destLon,
                            String etaAis) {
        this.mmsi = mmsi;
        this.latSource = latSource;
        this.lonSource = lonSource;
        this.creationTimestamp = creationTimestamp;
        this.currentLat = currentLat;
        this.currentLon = currentLon;
        this.latestLogTimestamp = latestLogTimestamp;
        this.destLat = destLat;
        this.destLon = destLon;
        this.etaAis = etaAis;
    }

    // Getters and setters

    public long getMmsi() {
        return mmsi;
    }

    public double getLatSource() {
        return latSource;
    }

    public double getLonSource() {
        return lonSource;
    }

    public String getCreationTimestamp() {
        return creationTimestamp;
    }

    public double getCurrentLat() {
        return currentLat;
    }

    public void setCurrentLat(double currentLat) {
        this.currentLat = currentLat;
    }

    public double getCurrentLon() {
        return currentLon;
    }

    public void setCurrentLon(double currentLon) {
        this.currentLon = currentLon;
    }

    public String getLatestLogTimestamp() {
        return latestLogTimestamp;
    }

    public void setLatestLogTimestamp(String latestLogTimestamp) {
        this.latestLogTimestamp = latestLogTimestamp;
    }

    public double getDestLat() {
        return destLat;
    }

    public void setDestLat(double destLat) {
        this.destLat = destLat;
    }

    public double getDestLon() {
        return destLon;
    }

    public void setDestLon(double destLon) {
        this.destLon = destLon;
    }

    public String getEtaAis() {
        return etaAis;
    }

    public void setEtaAis(String etaAis) {
        this.etaAis = etaAis;
    }

    @Override
    public String toString() {
        return "VesselTracking{" +
                "mmsi=" + mmsi +
                ", latSource=" + latSource +
                ", lonSource=" + lonSource +
                ", creationTimestamp='" + creationTimestamp + '\'' +
                ", currentLat=" + currentLat +
                ", currentLon=" + currentLon +
                ", latestLogTimestamp='" + latestLogTimestamp + '\'' +
                ", destLat=" + destLat +
                ", destLon=" + destLon +
                ", etaAis='" + etaAis + '\'' +
                '}';
    }
}