@@ .. @@
 package com.budgetwise.data.models;
 
 import java.math.BigDecimal;
+import java.math.RoundingMode;
 import java.util.Date;
+import java.util.Objects;
 
 public class Budget {
     private String id;
@@ .. @@
     }
 
     public void setAmount(BigDecimal amount) {
-        this.amount = amount;
+        // Fix: Ensure proper decimal precision for currency
+        this.amount = amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
     }
 
     public void setSpentAmount(BigDecimal spentAmount) {
-        this.spentAmount = spentAmount;
+        // Fix: Ensure proper decimal precision for currency
+        this.spentAmount = spentAmount != null ? spentAmount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
     }
 
     public String getCategory() {
@@ .. @@
     public void setEndDate(Date endDate) {
         this.endDate = endDate;
     }
+
+    // Fix: Add proper equals and hashCode methods
+    @Override
+    public boolean equals(Object o) {
+        if (this == o) return true;
+        if (o == null || getClass() != o.getClass()) return false;
+        Budget budget = (Budget) o;
+        return Objects.equals(id, budget.id);
+    }
+
+    @Override
+    public int hashCode() {
+        return Objects.hash(id);
+    }
+
+    // Fix: Add validation and utility methods
+    public boolean isValid() {
+        return id != null && !id.trim().isEmpty() &&
+               amount != null && amount.compareTo(BigDecimal.ZERO) > 0 &&
+               category != null && !category.trim().isEmpty() &&
+               startDate != null && endDate != null &&
+               !endDate.before(startDate);
+    }
+
+    public BigDecimal getRemainingAmount() {
+        if (amount == null || spentAmount == null) {
+            return BigDecimal.ZERO;
+        }
+        return amount.subtract(spentAmount);
+    }
+
+    public boolean isOverBudget() {
+        return spentAmount != null && amount != null && 
+               spentAmount.compareTo(amount) > 0;
+    }
 }