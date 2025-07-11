@@ .. @@
 import javax.crypto.spec.SecretKeySpec;
 import java.security.SecureRandom;
 import java.nio.charset.StandardCharsets;
+import java.security.NoSuchAlgorithmException;
+import javax.crypto.NoSuchPaddingException;
+import javax.crypto.BadPaddingException;
+import javax.crypto.IllegalBlockSizeException;
+import java.security.InvalidKeyException;
+import java.security.InvalidAlgorithmParameterException;
 
 public class EncryptionManager {
     private static final String TAG = "EncryptionManager";
@@ .. @@
     }
 
     public String encrypt(String data) {
+        if (data == null || data.isEmpty()) {
+            return "";
+        }
+        
         try {
             Cipher cipher = Cipher.getInstance(TRANSFORMATION);
             byte[] iv = new byte[16];
@@ .. @@
             return Base64.encodeToString(encryptedData, Base64.DEFAULT);
-        } catch (Exception e) {
+        } catch (NoSuchAlgorithmException | NoSuchPaddingException | 
+                 InvalidKeyException | InvalidAlgorithmParameterException |
+                 IllegalBlockSizeException | BadPaddingException e) {
             Log.e(TAG, "Encryption failed", e);
             return null;
         }
     }
 
     public String decrypt(String encryptedData) {
+        if (encryptedData == null || encryptedData.isEmpty()) {
+            return "";
+        }
+        
         try {
             byte[] decodedData = Base64.decode(encryptedData, Base64.DEFAULT);
+            
+            // Fix: Check minimum length for IV + data
+            if (decodedData.length < 16) {
+                Log.e(TAG, "Invalid encrypted data length");
+                return null;
+            }
+            
             byte[] iv = new byte[16];
             System.arraycopy(decodedData, 0, iv, 0, 16);
             
@@ .. @@
             cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
             byte[] decryptedData = cipher.doFinal(decodedData, 16, decodedData.length - 16);
             return new String(decryptedData, StandardCharsets.UTF_8);
-        } catch (Exception e) {
+        } catch (IllegalArgumentException | NoSuchAlgorithmException | 
+                 NoSuchPaddingException | InvalidKeyException | 
+                 InvalidAlgorithmParameterException | IllegalBlockSizeException | 
+                 BadPaddingException e) {
             Log.e(TAG, "Decryption failed", e);
             return null;
         }
     }
+
+    // Fix: Add method to securely clear sensitive data
+    public void clearKey() {
+        if (secretKey != null) {
+            // In a real implementation, you'd want to clear the key bytes
+            secretKey = null;
+        }
+    }
 }