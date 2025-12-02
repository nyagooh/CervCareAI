# Activate Virtual Environment and Run Commands
# Usage: .\activate_and_run.ps1
#
# This script activates the virtual environment and keeps it active

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

Write-Host "✓ Virtual environment activated!" -ForegroundColor Green
Write-Host "  Python version:" -NoNewline
python --version
Write-Host "  Location: $env:VIRTUAL_ENV" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  python src/mlflow_config.py          - Initialize MLflow"
Write-Host "  python src/pipelines/training_pipeline.py   - Train risk model"
Write-Host "  python src/pipelines/image_training_pipeline.py  - Train image model" 
Write-Host "  python src/api/main.py               - Start FastAPI server"
Write-Host "  mlflow ui                            - Start MLflow UI"
Write-Host ""
