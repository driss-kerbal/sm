# Deployment Guide

## Déploiement sur Vercel

L'application Student Management System est complètement prête pour le déploiement sur Vercel.

### Étapes de déploiement

1. **Accédez à Vercel**
   - Allez à https://vercel.com
   - Connectez-vous avec votre compte GitHub

2. **Importer le projet**
   - Cliquez sur "New Project"
   - Sélectionnez le dépôt `sm` depuis votre compte GitHub
   - Vercel détectera automatiquement que c'est un projet Next.js

3. **Configurer les variables d'environnement**
   - Dans les paramètres du projet, allez à "Environment Variables"
   - Ajoutez les variables suivantes :
     ```
     NEXTAUTH_URL=https://your-domain.vercel.app
     NEXTAUTH_SECRET=<generate-a-secure-secret>
     ```
   - Pour générer un secret sécurisé, exécutez :
     ```bash
     openssl rand -base64 32
     ```

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel compilera et déploiera automatiquement votre application

### Configuration Vercel.json

Le fichier `vercel.json` à la racine du projet est déjà configuré :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm ci"
}
```

### Domaine personnalisé

1. Allez aux paramètres du projet dans Vercel
2. Cliquez sur "Domains"
3. Ajoutez votre domaine personnalisé
4. Suivez les instructions DNS

### Monitoring et Logs

- Accédez à https://vercel.com/dashboard
- Cliquez sur votre projet
- Consultez les "Deployments" et "Logs" pour suivre le statut

## Notes de production

1. **Base de données**
   - SQLite fonctionne en développement et pour les déploiements Vercel
   - Pour une meilleure scalabilité, considérez PostgreSQL avec Neon

2. **Sécurité**
   - Changez le mot de passe admin par défaut après le déploiement
   - Utilisez HTTPS partout
   - Ne commitez jamais les secrets dans Git

3. **Performance**
   - Le cache Next.js améliore les performances
   - Vercel offre la réplication mondiale automatique

## Dépannage

### Erreur ENOENT students.db
- SQLite crée la base de données automatiquement au premier accès
- Si le problème persiste, vérifiez les permissions de fichier

### NextAuth ne fonctionne pas
- Vérifiez que `NEXTAUTH_URL` correspond exactement à votre URL Vercel
- Assurez-vous que `NEXTAUTH_SECRET` est défini
- Videz le cache Vercel et redéployez

### API 401 Unauthorized
- Vérifiez que vous êtes authentifié
- Assurez-vous que le token JWT est valide
- Vérifiez les logs de la console du navigateur

## Support

Pour toute question concernant le déploiement, consultez :
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [GitHub Issues](https://github.com/driss-kerbal/sm/issues)
