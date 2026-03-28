

## Problem: Roblox-Suche funktioniert nicht

### Ursachen

1. **Doppeltes URL-Encoding**: `keyword` wird einmal in der inneren URL und nochmal durch das äußere `encodeURIComponent` kodiert — das ergibt fehlerhafte Anfragen.
2. **Unzuverlässiger CORS-Proxy**: `corsproxy.io` ist oft instabil oder blockiert Anfragen.

### Lösung

1. **Eigene Supabase Edge Function als CORS-Proxy erstellen** — das ist zuverlässiger als ein öffentlicher Proxy-Dienst.
   - Neue Edge Function `roblox-proxy` die Anfragen an die Roblox-API weiterleitet
   - Korrekte CORS-Headers setzen

2. **Alternativ (schnellere Lösung)**: Anderen, zuverlässigeren CORS-Proxy verwenden (z.B. `api.allorigins.win`) und das doppelte Encoding beheben.

### Empfohlener Ansatz: Proxy wechseln + Encoding fix

**Datei: `src/pages/Index.tsx`**

- Proxy-URL ändern von `corsproxy.io` zu `api.allorigins.win/raw?url=`
- Das doppelte `encodeURIComponent` beim `keyword` entfernen — nur die äußere URL encodieren
- Gleiches für die Avatar-Thumbnail-URLs anwenden
- Fallback/Error-Handling verbessern mit `console.error` damit Fehler sichtbar werden

### Technische Details

```text
Vorher (kaputt):
  corsproxy.io/?url=encodeURIComponent("...keyword=encodeURIComponent(keyword)...")
  → keyword wird doppelt encoded

Nachher (korrekt):  
  api.allorigins.win/raw?url=encodeURIComponent("...keyword=keyword...")
  → nur die gesamte URL wird einmal encoded
```

Alle 4 Stellen mit Proxy-URLs werden aktualisiert (1x Suche, 3x Avatar-Thumbnails).

