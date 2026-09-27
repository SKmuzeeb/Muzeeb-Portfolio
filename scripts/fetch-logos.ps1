$slugs = @(
  'react','nodedotjs','postgresql','mysql','awslambda','amazons3','amazonwebservices',
  'google','microsoft','microsoftoutlook','microsoftsharepoint','googledrive','googlegmail',
  'stripe','graphql','github','git','postman','javascript','html5','css3','reactrouter',
  'bitbucket','swagger','knex','helcim','pgadmin','gmail','dropbox'
)
$out = [ordered]@{}
foreach ($s in $slugs) {
  try {
    $r = Invoke-WebRequest -Uri "https://unpkg.com/simple-icons@13/icons/$s.svg" -UseBasicParsing -TimeoutSec 20
    $m = [regex]::Match($r.Content, '<title>(.*?)</title>\s*<path d="([^"]+)"')
    if ($m.Success) { $out[$s] = @{ t = $m.Groups[1].Value; d = $m.Groups[2].Value }; "OK    $s" }
    else { "PARSE $s" }
  } catch { "MISS  $s" }
}
$json = $out | ConvertTo-Json -Depth 4 -Compress
Set-Content -Path 'scripts\logos-raw.json' -Value $json -Encoding UTF8
"--- captured: $($out.Count) ---"

