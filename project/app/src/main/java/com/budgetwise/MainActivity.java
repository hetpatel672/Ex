@@ .. @@
 package com.budgetwise;
 
 import android.os.Bundle;
+import android.util.Log;
 import androidx.appcompat.app.AppCompatActivity;
 import androidx.navigation.NavController;
 import androidx.navigation.Navigation;
@@ .. @@
 
 public class MainActivity extends AppCompatActivity {
+    private static final String TAG = "MainActivity";
     private AppBarConfiguration appBarConfiguration;
 
     @Override
     protected void onCreate(Bundle savedInstanceState) {
+        try {
             super.onCreate(savedInstanceState);
             setContentView(R.layout.activity_main);
 
@@ .. @@
             appBarConfiguration = new AppBarConfiguration.Builder(
                     R.id.navigation_dashboard, R.id.navigation_analytics, 
                     R.id.navigation_transactions, R.id.navigation_settings)
                     .build();
             NavigationUI.setupActionBarWithNavController(this, navController, appBarConfiguration);
             NavigationUI.setupWithNavController(bottomNav, navController);
+        } catch (Exception e) {
+            Log.e(TAG, "Error in onCreate", e);
+            // Handle gracefully - maybe show error dialog or restart
+        }
     }
 
     @Override
     public boolean onSupportNavigateUp() {
         NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment);
         return NavigationUI.navigateUp(navController, appBarConfiguration)
                 || super.onSupportNavigateUp();
     }
 }