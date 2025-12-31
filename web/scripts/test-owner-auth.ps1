# Test x-gf-secret Authentication

# Set your GF_SECRET_KEY from environment
$GF_SECRET = $env:GF_SECRET_KEY

if (-not $GF_SECRET) {
    Write-Host "❌ GF_SECRET_KEY not set in environment" -ForegroundColor Red
    Write-Host "Set it with: `$env:GF_SECRET_KEY = 'your-secret-here'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔐 Testing with x-gf-secret authentication..." -ForegroundColor Cyan

$url = "https://www.grantfounders.com/api/ace/score"

$testProject = @{
    project_name = "Owner Test - Bypass Authentication"
    sector = "gov"
    budget = 1000000
    duration_months = 24
    beneficiaries = 5000
    esg_score = 80
    risk_index = 30
    execution_capacity = 85
    scalability = 75
    strategic_value = 88
    compliance_score = 90
    expected_roi = 15
} | ConvertTo-Json

Write-Host "`n📤 Sending request to: $url" -ForegroundColor Gray
Write-Host "🔑 Using x-gf-secret header (owner bypass)" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url `
        -Method POST `
        -Headers @{ 
            "x-gf-secret" = $GF_SECRET
            "Content-Type" = "application/json" 
        } `
        -Body $testProject

    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White

    if ($response.ok) {
        Write-Host "`n🎯 ACE Score: $($response.data.final_score)" -ForegroundColor Green
        Write-Host "⭐ Tier: $($response.data.tier)" -ForegroundColor Green
        Write-Host "🤖 Kernel: $($response.data.kernel)" -ForegroundColor Green
    }
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nError Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    }
    exit 1
}
