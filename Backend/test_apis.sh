#!/bin/bash

# API Test Script for Expense Tracker Backend
# This script tests all the APIs and saves the results to apitestresult.txt

BASE_URL="http://localhost:3001/api"
OUTPUT_FILE="apitestresult.txt"

# Clear the output file
> "$OUTPUT_FILE"

# Function to log test results
log_test() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local request_data="$4"
    local response_code="$5"
    local response_body="$6"

    echo "=== $test_name ===" >> "$OUTPUT_FILE"
    echo "Endpoint: $method $url" >> "$OUTPUT_FILE"
    if [ -n "$request_data" ]; then
        echo "Request Data: $request_data" >> "$OUTPUT_FILE"
    fi
    echo "Response Code: $response_code" >> "$OUTPUT_FILE"
    echo "Response Body:" >> "$OUTPUT_FILE"
    echo "$response_body" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
}

# Test data
TEST_USER1_NAME="Test User"
TEST_USER1_USERNAME="testuser123"
TEST_USER1_EMAIL="test@example.com"
TEST_USER1_PASSWORD="TestPass123!"
TEST_USER1_PHONENUMBER="1234567890"
TEST_USER1_COLLEGE="Test College"

TEST_USER2_NAME="Test User 2"
TEST_USER2_USERNAME="testuser456"
TEST_USER2_EMAIL="test2@example.com"
TEST_USER2_PASSWORD="TestPass456!"
TEST_USER2_PHONENUMBER="0987654321"
TEST_USER2_COLLEGE="Test College 2"

TEST_GROUP_NAME="Test Group"
TEST_GROUP_CATEGORY="Food"
TEST_GROUP_DESCRIPTION="Test group for API testing"

# We'll store tokens and IDs from the responses
TOKEN_USER1=""
TOKEN_USER2=""
USER1_ID=""
USER2_ID=""
GROUP_ID=""
INVITATION_ID=""
EXPENSE_ID=""
EXPENSE_ITEM_ID=""
PAYMENT_ID=""

# Helper function to extract JSON value
extract_json_value() {
    local json="$1"
    local key="$2"
    echo "$json" | grep -o '"'$key'"[^,}]*' | cut -d'"' -f4
}

# Test: Health Check
echo "Testing Health Check..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3001/")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Health Check" "GET" "http://localhost:3001/" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Register User 1
echo "Testing Register User 1..."
REGISTER_DATA=$(cat <<EOF
{
    "name": "$TEST_USER1_NAME",
    "username": "$TEST_USER1_USERNAME",
    "email": "$TEST_USER1_EMAIL",
    "password": "$TEST_USER1_PASSWORD",
    "phonenumber": "$TEST_USER1_PHONENUMBER",
    "college": "$TEST_USER1_COLLEGE"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/register" -H "Content-Type: application/json" -d "$REGISTER_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Register User 1" "POST" "$BASE_URL/users/register" "$REGISTER_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
# Extract token and user id if successful
if [ "$HTTP_CODE" -eq 201 ]; then
    TOKEN_USER1=$(extract_json_value "$RESPONSE_BODY" "token")
    USER1_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Register User 2
echo "Testing Register User 2..."
REGISTER_DATA=$(cat <<EOF
{
    "name": "$TEST_USER2_NAME",
    "username": "$TEST_USER2_USERNAME",
    "email": "$TEST_USER2_EMAIL",
    "password": "$TEST_USER2_PASSWORD",
    "phonenumber": "$TEST_USER2_PHONENUMBER",
    "college": "$TEST_USER2_COLLEGE"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/register" -H "Content-Type: application/json" -d "$REGISTER_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Register User 2" "POST" "$BASE_URL/users/register" "$REGISTER_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
# Extract token and user id if successful
if [ "$HTTP_CODE" -eq 201 ]; then
    TOKEN_USER2=$(extract_json_value "$RESPONSE_BODY" "token")
    USER2_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Login User 1 (to get token, though we already have from registration)
echo "Testing Login User 1..."
LOGIN_DATA=$(cat <<EOF
{
    "email": "$TEST_USER1_EMAIL",
    "password": "$TEST_USER1_PASSWORD"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/login" -H "Content-Type: application/json" -d "$LOGIN_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Login User 1" "POST" "$BASE_URL/users/login" "$LOGIN_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
# Override token from login (should be same)
if [ "$HTTP_CODE" -eq 200 ]; then
    TOKEN_USER1=$(extract_json_value "$RESPONSE_BODY" "token")
    USER1_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Login User 2
echo "Testing Login User 2..."
LOGIN_DATA=$(cat <<EOF
{
    "email": "$TEST_USER2_EMAIL",
    "password": "$TEST_USER2_PASSWORD"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/login" -H "Content-Type: application/json" -d "$LOGIN_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Login User 2" "POST" "$BASE_URL/users/login" "$LOGIN_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
if [ "$HTTP_CODE" -eq 200 ]; then
    TOKEN_USER2=$(extract_json_value "$RESPONSE_BODY" "token")
    USER2_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Get Profile User 1
echo "Testing Get Profile User 1..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/profile" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Profile User 1" "GET" "$BASE_URL/users/profile" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Profile User 2
echo "Testing Get Profile User 2..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/profile" -H "Authorization: Bearer $TOKEN_USER2")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Profile User 2" "GET" "$BASE_URL/users/profile" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Update Profile User 1
echo "Testing Update Profile User 1..."
UPDATE_DATA=$(cat <<EOF
{
    "name": "Updated Test User",
    "college": "Updated College"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/profile" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$UPDATE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Update Profile User 1" "PUT" "$BASE_URL/users/profile" "$UPDATE_DATA" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Update Profile User 2
echo "Testing Update Profile User 2..."
UPDATE_DATA=$(cat <<EOF
{
    "name": "Updated Test User 2",
    "college": "Updated College 2"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/profile" -H "Authorization: Bearer $TOKEN_USER2" -H "Content-Type: application/json" -d "$UPDATE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Update Profile User 2" "PUT" "$BASE_URL/users/profile" "$UPDATE_DATA" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Change Password User 1
echo "Testing Change Password User 1..."
PWD_DATA=$(cat <<EOF
{
    "currentPassword": "$TEST_USER1_PASSWORD",
    "newPassword": "NewPass123!"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/change-password" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$PWD_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Change Password User 1" "PUT" "$BASE_URL/users/change-password" "$PWD_DATA" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Login User 1 with new password
echo "Testing Login User 1 with new password..."
LOGIN_DATA=$(cat <<EOF
{
    "email": "$TEST_USER1_EMAIL",
    "password": "NewPass123!"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/login" -H "Content-Type: application/json" -d "$LOGIN_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Login User 1 with New Password" "POST" "$BASE_URL/users/login" "$LOGIN_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
if [ "$HTTP_CODE" -eq 200 ]; then
    TOKEN_USER1=$(extract_json_value "$RESPONSE_BODY" "token")
fi

# Test: Create Group
echo "Testing Create Group..."
GROUP_DATA=$(cat <<EOF
{
    "name": "$TEST_GROUP_NAME",
    "category": "$TEST_GROUP_CATEGORY",
    "description": "$TEST_GROUP_DESCRIPTION"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/groups" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$GROUP_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Create Group" "POST" "$BASE_URL/groups" "$GROUP_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
if [ "$HTTP_CODE" -eq 201 ]; then
    GROUP_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Get All Groups
echo "Testing Get All Groups..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/groups" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get All Groups" "GET" "$BASE_URL/groups" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Group by ID
echo "Testing Get Group by ID..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/groups/$GROUP_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Group by ID" "GET" "$BASE_URL/groups/$GROUP_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Update Group
echo "Testing Update Group..."
UPDATE_DATA=$(cat <<EOF
{
    "name": "Updated Test Group",
    "description": "Updated description for test group"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/groups/$GROUP_ID" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$UPDATE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Update Group" "PUT" "$BASE_URL/groups/$GROUP_ID" "$UPDATE_DATA" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Send Invitation (User1 invites User2 to the group)
echo "Testing Send Invitation..."
INVITE_DATA=$(cat <<EOF
{
    "groupId": "$GROUP_ID",
    "invitedUser": "$USER2_ID"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/invitations" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$INVITE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Send Invitation" "POST" "$BASE_URL/invitations" "$INVITE_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
if [ "$HTTP_CODE" -eq 201 ]; then
    INVITATION_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Get My Invitations (User2)
echo "Testing Get My Invitations (User2)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/invitations" -H "Authorization: Bearer $TOKEN_USER2")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get My Invitations (User2)" "GET" "$BASE_URL/invitations" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Accept Invitation (User2)
echo "Testing Accept Invitation..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/invitations/$INVITATION_ID/accept" -H "Authorization: Bearer $TOKEN_USER2")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Accept Invitation" "PUT" "$BASE_URL/invitations/$INVITATION_ID/accept" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Create Expense (by User1 in the group)
echo "Testing Create Expense..."
EXPENSE_DATA=$(cat <<EOF
{
    "name": "Test Expense",
    "amount": 1000,
    "groupId": "$GROUP_ID",
    "paidBy": "$USER1_ID",
    "date": "2026-09-12",
    "category": "Food",
    "description": "Test expense for API testing"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/expenses" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$EXPENSE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Create Expense" "POST" "$BASE_URL/expenses" "$EXPENSE_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
if [ "$HTTP_CODE" -eq 201 ]; then
    EXPENSE_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Get Expenses by Group
echo "Testing Get Expenses by Group..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/expenses/group/$GROUP_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Expenses by Group" "GET" "$BASE_URL/expenses/group/$GROUP_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Expense by ID
echo "Testing Get Expense by ID..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/expenses/$EXPENSE_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Expense by ID" "GET" "$BASE_URL/expenses/$EXPENSE_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Update Expense
echo "Testing Update Expense..."
UPDATE_DATA=$(cat <<EOF
{
    "name": "Updated Test Expense",
    "amount": 1500
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/expenses/$EXPENSE_ID" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$UPDATE_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Update Expense" "PUT" "$BASE_URL/expenses/$EXPENSE_ID" "$UPDATE_DATA" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Create Expense Item
echo "Testing Create Expense Item..."
ITEM_DATA=$(cat <<EOF
{
    "name": "Test Item",
    "amount": 500,
    "expenseId": "$EXPENSE_ID",
    "participantIds": ["$USER1_ID", "$USER2_ID"]
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/expense-items" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$ITEM_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Create Expense Item" "POST" "$BASE_URL/expense-items" "$ITEM_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
if [ "$HTTP_CODE" -eq 201 ]; then
    EXPENSE_ITEM_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Get Expense Items by Expense ID
echo "Testing Get Expense Items by Expense ID..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/expense-items/$EXPENSE_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Expense Items by Expense ID" "GET" "$BASE_URL/expense-items/$EXPENSE_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Delete Expense Item
echo "Testing Delete Expense Item..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/expense-items/$EXPENSE_ITEM_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Delete Expense Item" "DELETE" "$BASE_URL/expense-items/$EXPENSE_ITEM_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Splits Me
echo "Testing Get Splits Me..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/splits/me" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Splits Me" "GET" "$BASE_URL/splits/me" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Splits by Expense ID
echo "Testing Get Splits by Expense ID..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/splits/$EXPENSE_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Splits by Expense ID" "GET" "$BASE_URL/splits/$EXPENSE_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Pay Split (we need a split ID, but we don't have one from the expense because splits are not auto-created)
# We'll skip this for now and note that it requires a split from an expense with splits.
# Instead, we'll test with a non-existent ID to see the error.
echo "Testing Pay Split (with non-existent ID)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/splits/000000000000000000000000/pay" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Pay Split (non-existent ID)" "PUT" "$BASE_URL/splits/000000000000000000000000/pay" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Create Payment
echo "Testing Create Payment..."
PAYMENT_DATA=$(cat <<EOF
{
    "fromUser": "$USER1_ID",
    "toUser": "$USER2_ID",
    "amount": 500,
    "groupId": "$GROUP_ID",
    "description": "Test payment for API testing"
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/payments" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$PAYMENT_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Create Payment" "POST" "$BASE_URL/payments" "$PAYMENT_DATA" "$HTTP_CODE" "$RESPONSE_BODY"
if [ "$HTTP_CODE" -eq 201 ]; then
    PAYMENT_ID=$(extract_json_value "$RESPONSE_BODY" "_id")
fi

# Test: Get Payments Me
echo "Testing Get Payments Me..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/payments/me" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Payments Me" "GET" "$BASE_URL/payments/me" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Payments by Group
echo "Testing Get Payments by Group..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/payments/group/$GROUP_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Payments by Group" "GET" "$BASE_URL/payments/group/$GROUP_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Complete Payment
echo "Testing Complete Payment..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/payments/$PAYMENT_ID/complete" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Complete Payment" "PUT" "$BASE_URL/payments/$PAYMENT_ID/complete" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Reject Payment
echo "Testing Reject Payment..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/payments/$PAYMENT_ID/reject" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Reject Payment" "PUT" "$BASE_URL/payments/$PAYMENT_ID/reject" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Balances by Group
echo "Testing Get Balances by Group..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/balances/$GROUP_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Balances by Group" "GET" "$BASE_URL/balances/$GROUP_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Activities Me
echo "Testing Get Activities Me..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/activities/me" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Activities Me" "GET" "$BASE_URL/activities/me" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Activities by Group
echo "Testing Get Activities by Group..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/activities/group/$GROUP_ID" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Activities by Group" "GET" "$BASE_URL/activities/group/$GROUP_ID" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Get Settings
echo "Testing Get Settings..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/settings" -H "Authorization: Bearer $TOKEN_USER1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Get Settings" "GET" "$BASE_URL/settings" "" "$HTTP_CODE" "$RESPONSE_BODY"

# Test: Update Settings
echo "Testing Update Settings..."
SETTINGS_DATA=$(cat <<EOF
{
    "currency": "USD",
    "theme": "dark",
    "notifications": false,
    "emailAlerts": true
}
EOF
)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/settings" -H "Authorization: Bearer $TOKEN_USER1" -H "Content-Type: application/json" -d "$SETTINGS_DATA")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)
log_test "Update Settings" "PUT" "$BASE_URL/settings" "$SETTINGS_DATA" "$HTTP_CODE" "$RESPONSE_BODY"

echo "All tests completed. Results saved to $OUTPUT_FILE"