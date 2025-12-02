import mlflow

mlflow.set_tracking_uri('file:///./mlruns')
client = mlflow.tracking.MlflowClient()

print("\n" + "="*70)
print("MLFLOW EXPERIMENTS STATUS")
print("="*70)

# List all experiments
experiments = client.search_experiments()
print(f"\nTotal experiments: {len(experiments)}")
for exp in experiments:
    print(f"  - {exp.name} (ID: {exp.experiment_id})")

# Check risk-prediction experiment
exp = client.get_experiment_by_name('risk-prediction')
if exp:
    print(f"\nRisk prediction experiment ID: {exp.experiment_id}")
    runs = client.search_runs([exp.experiment_id], max_results=10)
    print(f"Number of runs: {len(runs)}")
    
    if runs:
        print("\nRecent runs:")
        for i, run in enumerate(runs, 1):
            print(f"\n  Run {i}:")
            print(f"    Name: {run.info.run_name}")
            print(f"    Status: {run.info.status}")
            print(f"    Start time: {run.info.start_time}")
            
            # Show some metrics
            if run.data.metrics:
                print(f"    Metrics: {list(run.data.metrics.keys())[:5]}")
    else:
        print("\n⚠️ No runs found in this experiment!")
else:
    print("\n⚠️ Risk-prediction experiment not found!")

print("\n" + "="*70)
