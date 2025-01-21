package com.example.flink.models;

import java.time.OffsetDateTime;



public class Vessel {
   private long mmsi;
   private long imo;
   private String callsign;
   private double a;
   private double b;
   private double c;
   private double d;
   private double draught;
   private String destination;
   private String locode;
   private String zone;
   private boolean eca;
   private String src;
   private double latitude;
   private double longitude;
   private double course;
   private double speed;
   private OffsetDateTime etaAis;
   private double destLat;
   private double destLon;
   private OffsetDateTime timestamp;

   // Default constructor
   public Vessel() {}

   // Full constructor
   public Vessel(long mmsi, long imo, String callsign, double a, double b, double c, double d, 
             double draught, String destination, String locode, String zone, boolean eca, 
             String src, double latitude, double longitude, double course, double speed, 
             OffsetDateTime etaAis, double destLat, double destLon, OffsetDateTime timestamp) {
      this.mmsi = mmsi;
      this.imo = imo;
      this.callsign = callsign;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.draught = draught;
      this.destination = destination;
      this.locode = locode;
      this.zone = zone;
      this.eca = eca;
      this.src = src;
      this.latitude = latitude;
      this.longitude = longitude;
      this.course = course;
      this.speed = speed;
      this.etaAis = etaAis;
      this.destLat = destLat;
      this.destLon = destLon;
      this.timestamp = timestamp;
   }

   // Getters and Setters
   public long getMmsi() { return mmsi; }
   public void setMmsi(long mmsi) { this.mmsi = mmsi; }

   public long getImo() { return imo; }
   public void setImo(long imo) { this.imo = imo; }

   public String getCallsign() { return callsign; }
   public void setCallsign(String callsign) { this.callsign = callsign; }

   public double getA() { return a; }
   public void setA(double a) { this.a = a; }

   public double getB() { return b; }
   public void setB(double b) { this.b = b; }

   public double getC() { return c; }
   public void setC(double c) { this.c = c; }

   public double getD() { return d; }
   public void setD(double d) { this.d = d; }

   public double getDraught() { return draught; }
   public void setDraught(double draught) { this.draught = draught; }

   public String getDestination() { return destination; }
   public void setDestination(String destination) { this.destination = destination; }

   public String getLocode() { return locode; }
   public void setLocode(String locode) { this.locode = locode; }

   public String getZone() { return zone; }
   public void setZone(String zone) { this.zone = zone; }

   public boolean isEca() { return eca; }
   public void setEca(boolean eca) { this.eca = eca; }

   public String getSrc() { return src; }
   public void setSrc(String src) { this.src = src; }

   public double getLatitude() { return latitude; }
   public void setLatitude(double latitude) { this.latitude = latitude; }

   public double getLongitude() { return longitude; }
   public void setLongitude(double longitude) { this.longitude = longitude; }

   public double getCourse() { return course; }
   public void setCourse(double course) { this.course = course; }

   public double getSpeed() { return speed; }
   public void setSpeed(double speed) { this.speed = speed; }

   public OffsetDateTime getEtaAis() { return etaAis; }
   public void setEtaAis(OffsetDateTime etaAis) { this.etaAis = etaAis; }

   public double getDestLat() { return destLat; }
   public void setDestLat(double destLat) { this.destLat = destLat; }

   public double getDestLon() { return destLon; }
   public void setDestLon(double destLon) { this.destLon = destLon; }

   public OffsetDateTime getTimestamp() { return timestamp; }
   public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
}