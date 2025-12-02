import mlflow

mlflow.set_tracking_uri('file:///./mlruns')
client = mlflow.tracking.MlflowClient()

exp = client.get_experiment_by_name('risk-prediction')
runs = client.search_runs(exp.experiment_id, order_by=['start_time DESC'], max_results=1)

if runs:
    run = runs[0]
    m = run.data.metrics
    
    print("\n" + "="*70)
    print("5-FOLD CROSS-VALIDATION RESULTS")
    print("="*70)
    print("\nAVERAGED METRICS:")
    print("-"*70)
    print(f"ACCURACY  : {m.get('cv_mean_accuracy', 0):.4f} ± {m.get('cv_std_accuracy', 0):.4f}")
    print(f"PRECISION : {m.get('cv_mean_precision', 0):.4f} ± {m.get('cv_std_precision', 0):.4f}")
    print(f"RECALL    : {m.get('cv_mean_recall', 0):.4f} ± {m.get('cv_std_recall', 0):.4f}")
    print(f"F1 SCORE  : {m.get('cv_mean_f1', 0):.4f} ± {m.get('cv_std_f1', 0):.4f}")
    print(f"ROC AUC   : {m.get('cv_mean_roc_auc', 0):.4f} ± {m.get('cv_std_roc_auc', 0):.4f}")
    
    print("\n" + "="*70)
    print("PER-FOLD BREAKDOWN:")
    print("="*70)
    
    for fold in range(1, 6):
        print(f"\nFold {fold}:")
        print(f"  Accuracy : {m.get(f'fold{fold}_accuracy', 0):.4f}")
        print(f"  Precision: {m.get(f'fold{fold}_precision', 0):.4f}")
        print(f"  Recall   : {m.get(f'fold{fold}_recall', 0):.4f}")
        print(f"  F1       : {m.get(f'fold{fold}_f1', 0):.4f}")
        print(f"  ROC AUC  : {m.get(f'fold{fold}_roc_auc', 0):.4f}")
    
    print("\n" + "="*70)
