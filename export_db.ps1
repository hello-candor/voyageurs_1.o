$apiKey = "AIzaSyAC5sjtZnu9ccHXLVeoiawnjq0w_dwNeq8"
$projectId = "voyageurs-834eb"
$eventId = "voyageurs_2026"

Write-Host "Authenticating..."
$authBody = @{ returnSecureToken = $true } | ConvertTo-Json
$authResponse = Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$apiKey" -Method Post -Body $authBody -ContentType "application/json"
$token = $authResponse.idToken

Write-Host "Fetching guests..."
$url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/events/$eventId/guests?pageSize=1000"
$headers = @{ Authorization = "Bearer $token" }

$guests = @()
$hasMore = $true

while ($hasMore -and $url) {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    
    if ($response.documents) {
        foreach ($doc in $response.documents) {
            # Use ordered dictionary to keep some order, but PSObject is fine
            $guest = [ordered]@{}
            $docId = $doc.name.Split('/')[-1]
            $guest["id"] = $docId
            
            if ($doc.fields) {
                foreach ($key in $doc.fields.PSObject.Properties.Name) {
                    $field = $doc.fields.$key
                    
                    if ($null -ne $field.stringValue) { $guest[$key] = $field.stringValue }
                    elseif ($null -ne $field.integerValue) { $guest[$key] = $field.integerValue }
                    elseif ($null -ne $field.doubleValue) { $guest[$key] = $field.doubleValue }
                    elseif ($null -ne $field.booleanValue) { $guest[$key] = $field.booleanValue }
                    elseif ($null -ne $field.mapValue) { $guest[$key] = ($field.mapValue | ConvertTo-Json -Compress -Depth 10) }
                    elseif ($null -ne $field.arrayValue) { $guest[$key] = ($field.arrayValue | ConvertTo-Json -Compress -Depth 10) }
                    else { $guest[$key] = "" }
                }
            }
            
            $guests += New-Object PSObject -Property $guest
        }
    }
    
    if ($response.nextPageToken) {
        $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/events/$eventId/guests?pageSize=1000&pageToken=$($response.nextPageToken)"
    } else {
        $hasMore = $false
    }
}

Write-Host "Exporting $($guests.Count) guests to CSV..."
$guests | Export-Csv -Path "firestore_guests_export.csv" -NoTypeInformation -Encoding UTF8

Write-Host "✅ Done! Exported to firestore_guests_export.csv"
