import pickle

# Load results
with open('models/optimal_threshold.pkl', 'rb') as f:
    threshold_data = pickle.load(f)

print("\n" + "="*70)
print("OPTUNA OPTIMIZATION + THRESHOLD TUNING RESULTS")
print("="*70)

print("\n📊 OPTIMAL THRESHOLD:")
print(f"   Threshold: {threshold_data['threshold']:.4f} (default was 0.5000)")
print(f"   Improvement: {(threshold_data['threshold'] - 0.5)*100:+.2f}%")

print("\n📈 PERFORMANCE METRICS:")
print(f"   Accuracy:  {threshold_data['metrics']['accuracy']:.4f} ({threshold_data['metrics']['accuracy']*100:.2f}%)")
print(f"   Precision: {threshold_data['metrics']['precision']:.4f} ({threshold_data['metrics']['precision']*100:.2f}%)")
print(f"   Recall:    {threshold_data['metrics']['recall']:.4f} ({threshold_data['metrics']['recall']*100:.2f}%)")
print(f"   F1 Score:  {threshold_data['metrics']['f1']:.4f} ({threshold_data['metrics']['f1']*100:.2f}%)")

print("\n📊 COMPARISON WITH PREVIOUS MODEL:")
print(f"   Metric      | Previous | Optimized | Improvement")
print(f"   ------------|----------|-----------|------------")
print(f"   Accuracy    | 95.93%   | {threshold_data['metrics']['accuracy']*100:.2f}%     | {(threshold_data['metrics']['accuracy']*100 - 95.93):+.2f}%")
print(f"   Precision   | 64.02%   | {threshold_data['metrics']['precision']*100:.2f}%     | {(threshold_data['metrics']['precision']*100 - 64.02):+.2f}%")
print(f"   Recall      | 85.09%   | {threshold_data['metrics']['recall']*100:.2f}%     | {(threshold_data['metrics']['recall']*100 - 85.09):+.2f}%")
print(f"   F1 Score    | 72.80%   | {threshold_data['metrics']['f1']*100:.2f}%     | {(threshold_data['metrics']['f1']*100 - 72.80):+.2f}%")

print("\n💾 FILES SAVED:")
print(f"   ✓ models/risk_model_optuna.pkl (optimized model)")
print(f"   ✓ models/optimal_threshold.pkl (threshold: {threshold_data['threshold']:.4f})")
print(f"   ✓ models/risk_preprocessor.pkl")

print("\n🚀 HOW TO USE:")
print(f"   # Load model and threshold")
print(f"   import pickle")
print(f"   model = pickle.load(open('models/risk_model_optuna.pkl', 'rb'))")
print(f"   threshold_data = pickle.load(open('models/optimal_threshold.pkl', 'rb'))")
print(f"   threshold = threshold_data['threshold']")
print(f"   ")
print(f"   # Make predictions")
print(f"   y_proba = model.predict_proba(X)[:, 1]")
print(f"   y_pred = (y_proba >= threshold).astype(int)")

print("\n" + "="*70)
