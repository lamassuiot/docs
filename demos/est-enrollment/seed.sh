#!/usr/bin/env bash
# Synthetic seed data for the EST enrollment demo (no secrets involved).
set -euo pipefail
API=${API:-http://localhost:8080/api}
PROFILE=$(curl -s "$API/ca/v1/profiles?page_size=50" | python3 -c "import json,sys;print([p['id'] for p in json.load(sys.stdin)['list'] if p['name']=='Generated Root CA Profile'][0])")
DEVPROFILE=$(curl -s "$API/ca/v1/profiles?page_size=50" | python3 -c "import json,sys;print([p['id'] for p in json.load(sys.stdin)['list'] if p['name']=='Device Certificates'][0])")
CA=$(curl -s -X POST "$API/ca/v1/cas" -H 'Content-Type: application/json' -d "{
 \"profile_id\":\"$PROFILE\",
 \"subject\":{\"common_name\":\"Acme Device CA\",\"organization\":\"Acme IoT\",\"organization_unit\":\"Devices\",\"country\":\"ES\",\"state\":\"Gipuzkoa\",\"locality\":\"Arrasate\"},
 \"key_metadata\":{\"type\":\"ECDSA\",\"bits\":256},
 \"ca_expiration\":{\"type\":\"Duration\",\"duration\":\"5y\"}
}" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['id'])")
echo "CA=$CA"
curl -s -X POST "$API/dmsmanager/v1/dms" -H 'Content-Type: application/json' -d "{
 \"id\":\"est-showcase\",\"name\":\"EST Showcase\",
 \"settings\":{
  \"enrollment_settings\":{\"protocol\":\"EST_RFC7030\",
    \"est_rfc7030_settings\":{\"auth_mode\":\"NO_AUTH\"},
    \"enrollment_ca\":\"$CA\",\"registration_mode\":\"JITP\",\"verify_csr_signature\":true,
    \"enable_replaceable_enrollment\":false,
    \"device_provisioning_profile\":{\"icon\":\"Laptop\",\"icon_color\":\"#0066CC\",\"tags\":[\"est-demo\"]}},
  \"reenrollment_settings\":{\"est_rfc7030_settings\":{\"auth_mode\":\"CLIENT_CERTIFICATE\"},\"reenrollment_delta\":\"30d\",\"preventive_delta\":\"14d\",\"critical_delta\":\"7d\",\"revoke_on_reenrollment\":false,\"enable_expired_renewal\":false},
  \"ca_distribution_settings\":{\"include_system_ca\":true,\"include_enrollment_ca\":true,\"managed_cas\":[]},
  \"issuance_profile_id\":\"$DEVPROFILE\"
 }}" | head -c 600
