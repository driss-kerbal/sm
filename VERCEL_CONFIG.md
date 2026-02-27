# Configuration Vercel - Guide Complet

## ⚠️ Problème: Erreur 500 sur /api/auth/error

L'erreur 500 survient généralement parce que les **variables d'environnement ne sont pas configurées correctement** sur Vercel.

---

## ✅ Solution: Configurer les variables d'environnement

### Étape 1: Accédez à Vercel Dashboard
```
1. Allez à https://vercel.com/dashboard
2. Cliquez sur votre projet "sm"
3. Allez à "Settings"
```

### Étape 2: Ajouter les variables d'environnement

#### Dans "Settings" → "Environment Variables"

Ajoutez les deux variables suivantes:

| Variable | Valeur | Notes |
|----------|--------|-------|
| `NEXTAUTH_URL` | `https://sm1-eight.vercel.app` | Votre URL Vercel exacte |
| `NEXTAUTH_SECRET` | `[générer une nouvelle clé]` | Voir ci-dessous |

### Étape 3: Générer NEXTAUTH_SECRET

**Option 1: Utiliser OpenSSL (Linux/Mac)**
```bash
openssl rand -base64 32
```

**Option 2: Générateur en ligne**
- Allez à: https://generate-secret.vercel.app/32

**Option 3: Utiliser Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Exemple de secret valide:
```
9f7x8K2mL9pQ4wR6sT1uV3yZ5aB2cD4eF6gH8iJ0kL2mN4oP5qR6sT7uV8wX9yZ
```

### Étape 4: Sauvegarder et redéployer

```
1. Cliquez "Save"
2. Allez à "Deployments"
3. Cliquez sur le dernier déploiement
4. Cliquez "Redeploy"
5. Attendez la finalisation
```

---

## 🔍 Vérifier les variables d'environnement

### Pour s'assurer qu'elles sont bien configurées:

1. Allez à "Settings" → "Environment Variables"
2. Vérifiez que vous voyez:
   - ✅ `NEXTAUTH_URL` = `https://sm1-eight.vercel.app`
   - ✅ `NEXTAUTH_SECRET` = `[votre clé secrète]`

### ⚠️ Vérifier l'URL exacte

```bash
# Votre URL doit être EXACTEMENT:
https://sm1-eight.vercel.app

# PAS:
https://sm1-eight.vercel.app/
https://sm1-eight.vercel.app/login
```

---

## 🚀 Après la configuration

Une fois les variables ajoutées et le redéploiement fait:

1. Allez à `https://sm1-eight.vercel.app`
2. Cliquez sur "Sign In"
3. Entrez les identifiants:
   - **Email**: admin@example.com
   - **Mot de passe**: admin123
4. Vous devriez être connecté ✅

---

## 🐛 Si l'erreur persiste

### Vérifiez les logs Vercel

1. Allez à "Deployments"
2. Cliquez sur le dernier déploiement
3. Allez à "Runtime Logs"
4. Cherchez les erreurs

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `NEXTAUTH_SECRET is not set` | Variable d'env manquante | Ajouter la variable dans Settings |
| `NEXTAUTH_URL is not set` | Variable d'env manquante | Ajouter la variable dans Settings |
| `Invalid URL` | Format d'URL incorrect | Vérifier que l'URL n'a pas de slash final |
| `Error initializing db` | Problème SQLite | Vérifier les permissions |

---

## 📝 Format correct du vercel.json

Vérifiez que votre `vercel.json` ressemble à:

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "devCommand": "next dev",
  "installCommand": "npm ci",
  "framework": "nextjs"
}
```

---

## ✅ Checklist

- [ ] NEXTAUTH_URL configurée dans Vercel
- [ ] NEXTAUTH_SECRET configurée dans Vercel
- [ ] Redéploiement effectué
- [ ] URL exacte sans slash final
- [ ] Logs vérifiés pour les erreurs

---

## 💡 Notes importantes

1. **Ne commitez jamais** les secrets dans Git
2. **Générez une nouvelle clé** pour la production
3. **L'URL doit correspondre** exactement à votre domaine Vercel
4. **Attendez 30-60 secondes** après un redéploiement

---

## 📞 Debug supplémentaire

Si ça ne fonctionne toujours pas:

1. Videz le cache du navigateur (Ctrl+F5)
2. Vérifiez la console du navigateur (F12)
3. Consultez les Runtime Logs de Vercel
4. Essayez une navigation anonyme (Incognito)

