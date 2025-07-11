package com.budgetwise.ui.transactions;

import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;

import com.budgetwise.R;
import com.budgetwise.data.models.Transaction;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class AddTransactionDialogFragment extends DialogFragment {
    
    private EditText descriptionEditText;
    private EditText amountEditText;
    private EditText notesEditText;
    private Spinner categorySpinner;
    private RadioGroup typeRadioGroup;
    private Button saveButton;
    private Button cancelButton;
    
    private OnTransactionSavedListener listener;
    
    public interface OnTransactionSavedListener {
        void onTransactionSaved(Transaction transaction);
    }
    
    public static AddTransactionDialogFragment newInstance() {
        return new AddTransactionDialogFragment();
    }
    
    public void setOnTransactionSavedListener(OnTransactionSavedListener listener) {
        this.listener = listener;
    }
    
    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireActivity());
        LayoutInflater inflater = requireActivity().getLayoutInflater();
        
        View view = inflater.inflate(R.layout.dialog_add_transaction, null);
        initializeViews(view);
        setupSpinner();
        setupClickListeners();
        
        builder.setView(view)
               .setTitle("Add Transaction");
        
        return builder.create();
    }
    
    private void initializeViews(View view) {
        descriptionEditText = view.findViewById(R.id.et_description);
        amountEditText = view.findViewById(R.id.et_amount);
        notesEditText = view.findViewById(R.id.et_notes);
        categorySpinner = view.findViewById(R.id.spinner_category);
        typeRadioGroup = view.findViewById(R.id.rg_transaction_type);
        saveButton = view.findViewById(R.id.btn_save);
        cancelButton = view.findViewById(R.id.btn_cancel);
        
        // Validate views
        if (descriptionEditText == null || amountEditText == null || 
            categorySpinner == null || typeRadioGroup == null) {
            throw new IllegalStateException("Required views not found in layout");
        }
    }
    
    private void setupSpinner() {
        List<String> categories = Arrays.asList(
            "Food & Dining",
            "Transportation",
            "Shopping",
            "Entertainment",
            "Bills & Utilities",
            "Healthcare",
            "Education",
            "Travel",
            "Income",
            "Other"
        );
        
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
            requireContext(),
            android.R.layout.simple_spinner_item,
            categories
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        categorySpinner.setAdapter(adapter);
    }
    
    private void setupClickListeners() {
        saveButton.setOnClickListener(v -> saveTransaction());
        cancelButton.setOnClickListener(v -> dismiss());
    }
    
    private void saveTransaction() {
        // Clear previous errors
        clearErrors();
        
        // Get input values
        String description = descriptionEditText.getText().toString().trim();
        String amountStr = amountEditText.getText().toString().trim();
        String notes = notesEditText.getText().toString().trim();
        String category = categorySpinner.getSelectedItem().toString();
        
        // Validate inputs
        if (!validateInputs(description, amountStr)) {
            return;
        }
        
        BigDecimal amount;
        try {
            amount = new BigDecimal(amountStr);
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                amountEditText.setError("Amount must be greater than 0");
                return;
            }
        } catch (NumberFormatException e) {
            amountEditText.setError("Invalid amount format");
            return;
        }
        
        // Determine transaction type
        String type = getSelectedTransactionType();
        if (type == null) {
            Toast.makeText(getContext(), "Please select transaction type", Toast.LENGTH_SHORT).show();
            return;
        }
        
        try {
            // Create transaction
            Transaction transaction = new Transaction();
            transaction.setId(UUID.randomUUID().toString());
            transaction.setDescription(description);
            transaction.setAmount(amount);
            transaction.setCategory(category);
            transaction.setType(type);
            transaction.setNotes(notes);
            transaction.setDate(new Date());
            
            // Validate transaction
            if (!transaction.isValid()) {
                Toast.makeText(getContext(), "Invalid transaction data", Toast.LENGTH_SHORT).show();
                return;
            }
            
            // Notify listener
            if (listener != null) {
                listener.onTransactionSaved(transaction);
            }
            
            Toast.makeText(getContext(), "Transaction saved successfully", Toast.LENGTH_SHORT).show();
            dismiss();
            
        } catch (Exception e) {
            Toast.makeText(getContext(), "Error saving transaction: " + e.getMessage(), 
                         Toast.LENGTH_SHORT).show();
        }
    }
    
    private boolean validateInputs(String description, String amountStr) {
        boolean isValid = true;
        
        if (TextUtils.isEmpty(description)) {
            descriptionEditText.setError("Description is required");
            isValid = false;
        }
        
        if (TextUtils.isEmpty(amountStr)) {
            amountEditText.setError("Amount is required");
            isValid = false;
        }
        
        return isValid;
    }
    
    private String getSelectedTransactionType() {
        int selectedId = typeRadioGroup.getCheckedRadioButtonId();
        if (selectedId == R.id.rb_income) {
            return "INCOME";
        } else if (selectedId == R.id.rb_expense) {
            return "EXPENSE";
        }
        return null;
    }
    
    private void clearErrors() {
        descriptionEditText.setError(null);
        amountEditText.setError(null);
    }
    
    @Override
    public void onCancel(@NonNull DialogInterface dialog) {
        super.onCancel(dialog);
        // Handle dialog cancellation if needed
    }
}