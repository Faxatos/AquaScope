package com.example.flink.models;

import java.io.Serializable;

/**
 * POJO to carry the fields needed for checking/inserting a vessel in Cassandra.
 * These values are extracted from the log when a new vessel is first encountered.
 *
 * Fields:
 * - mmsi, imo, callsign, a, b, c, d, draught.
 */
public static class CassandraVesselInfo implements Serializable {
   private long mmsi;
   private long imo;
   private String callsign;
   private double a;
   private double b;
   private double c;
   private double d;
   private double draught;

   // No-args constructor
   public CassandraVesselInfo() {}

   public CassandraVesselInfo(long mmsi, long imo, String callsign, double a, double b,
                              double c, double d, double draught) {
      this.mmsi = mmsi;
      this.imo = imo;
      this.callsign = callsign;
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.draught = draught;
   }

   // Getters

   public long getMmsi() {
      return mmsi;
   }

   public long getImo() {
      return imo;
   }

   public String getCallsign() {
      return callsign;
   }

   public double getA() {
      return a;
   }

   public double getB() {
      return b;
   }

   public double getC() {
      return c;
   }

   public double getD() {
      return d;
   }

   public double getDraught() {
      return draught;
   }

   @Override
   public String toString() {
      return "CassandraVesselInfo{" +
               "mmsi=" + mmsi +
               ", imo=" + imo +
               ", callsign='" + callsign + '\'' +
               ", a=" + a +
               ", b=" + b +
               ", c=" + c +
               ", d=" + d +
               ", draught=" + draught +
               '}';
   }
}