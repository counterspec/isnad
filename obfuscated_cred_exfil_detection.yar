rule Base64EncodedExfiltrationURL {
    meta:
        description = "Detects base64-encoded exfiltration URLs in code"
        severity = "critical"
        confidence = 0.9
    strings:
        $b64_url = /(aHR0cDov|aHR0cHM6Ly)[A-Za-z0-9+\/=]{10,}/
        $b64_webhook = /(aG9va3Muc2xhY2suY29t|ZGlzY29yZC5jb20vYXBpL3dlYmhvb2tz|cmVxdWVzdGJpbi5jb20|bmdyb2suaW8)[A-Za-z0-9+\/=]{0,}/
    condition:
        any of them
}

rule HexConstructedAPIEndpoint {
    meta:
        description = "Detects API endpoints constructed from hex/charcode values"
        severity = "critical"
        confidence = 0.85
    strings:
        $hex_concat = /(0x[0-9a-fA-F]{2}\s*\+\s*){5,}/
        $charcode = /String\.fromCharCode\((0x[0-9a-fA-F]{1,2}|\d{1,3})(\s*,\s*(0x[0-9a-fA-F]{1,2}|\d{1,3})){5,}\)/
        $hex_decode = /(Buffer\.from|atob|decodeURIComponent|unescape)\s*\(\s*['"][0-9a-fA-F]{10,}['"]/
    condition:
        any of them
}

rule StringReversalObfuscation {
    meta:
        description = "Detects string reversal/concatenation obfuscation for exfiltration endpoints"
        severity = "high"
        confidence = 0.8
    strings:
        $reverse = /\.split\s*\(\s*['"]['"]\s*\)\.reverse\s*\(\s*\)\.join\s*\(\s*['"]['"]\s*\)/
        $concat = /(['"][a-z0-9\/:.]{2,}['"]\s*\+\s*){4,}/
        $substring = /(substr|substring|slice)\s*\(\s*\d+\s*,\s*\d+\s*\)\s*\+/
    condition:
        any of them and filesize < 200KB
}

rule ObfuscatedEnvHarvesting {
    meta:
        description = "Detects obfuscated environment variable harvesting and exfiltration"
        severity = "critical"
        confidence = 0.95
    strings:
        $env_access = /(process\.env|os\.getenv|getenv|env|ENV)\[['"]?[a-zA-Z0-9_]+['"]?\]/
        $obfuscated_key = /['"]([A-Z_]+)['"]\s*\.\s*(replace|substr|split|toUpperCase|toLowerCase)/
        $exfil_combine = /(fetch|axios|http\.get|request|send)\s*\(\s*.+\+.+(process|env|getenv)/
    condition:
        2 of them
}
