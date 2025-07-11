@@ .. @@
 package com.budgetwise.data.models;
 
 import java.math.BigDecimal;
+import java.math.RoundingMode;
 import java.util.Date;
+import java.util.Objects;
 
 public class Transaction {
     private String id;
@@ .. @@
     }
 
     public void setAmount(BigDecimal amount) {
-        this.amount = amount;
+        // Fix: Ensure proper decimal precision for currency
+        this.amount = amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
     }
 
     public String getCategory() {
@@ .. @@
     public void setDate(Date date) {
         this.date = date;
     }
+
+    // Fix: Add proper equals and hashCode methods
+    @Override
+    public boolean equals(Object o) {
+        if (this == o) return true;
+        if (o == null || getClass() != o.getClass()) return false;
+        Transaction that = (Transaction) o;
+        return Objects.equals(id, that.id);
+    }
+
+    @Override
+    public int hashCode() {
+        return Objects.hash(id);
+    }
+
+    // Fix: Add validation method
+    public boolean isValid() {
+        return id != null && !id.trim().isEmpty() &&
+               amount != null && amount.compareTo(BigDecimal.ZERO) >= 0 &&
+               category != null && !category.trim().isEmpty() &&
+               date != null;
+    }
 }