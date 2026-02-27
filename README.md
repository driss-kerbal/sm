# Student Management System (SMS)

Une application complète de gestion des étudiants construite avec **Next.js**, **SQLite**, et **NextAuth**.

## 🎯 Fonctionnalités

- ✅ **Authentification sécurisée** avec NextAuth
- ✅ **CRUD complet** pour la gestion des étudiants
- ✅ **Base de données SQLite** intégrée
- ✅ **Interface utilisateur moderne** avec Tailwind CSS
- ✅ **API REST** fully secured
- ✅ **Responsive design** pour desktop et mobile

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 18
- npm ou yarn

### Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/driss-kerbal/sm.git
cd sm
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos paramètres :
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Démarrage en mode développement

```bash
npm run dev
```

L'application sera disponible à http://localhost:3000

### Construction pour la production

```bash
npm run build
npm start
```

## 📝 Identifiants de démonstration

- **Email** : admin@example.com
- **Mot de passe** : admin123

## 🏗️ Architecture

### Structure du projet

```
sm/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]   # Configuration NextAuth
│   │   ├── setup/               # Endpoint d'initialisation
│   │   └── students/            # API CRUD étudiants
│   ├── dashboard/               # Pages tableau de bord
│   ├── login/                   # Page de connexion
│   ├── layout.tsx               # Layout racine
│   └── page.tsx                 # Page d'accueil
├── components/                  # Composants React
├── lib/
│   └── db.ts                    # Configuration SQLite
├── public/                      # Fichiers statiques
└── package.json
```

### Pile technologique

- **Frontend** : React 19, Next.js 16, Tailwind CSS
- **Backend** : Next.js API Routes
- **Authentication** : NextAuth 4
- **Database** : SQLite (better-sqlite3)
- **Type Safety** : TypeScript

## 📚 Endpoints API

### Authentification

POST `/api/auth/signin` - Connexion utilisateur
POST `/api/auth/signout` - Déconnexion
POST `/api/auth/callback/credentials` - Callback authentification

### Gestion des étudiants

- `GET /api/students` - Récupérer tous les étudiants
- `POST /api/students` - Créer un nouvel étudiant
- `GET /api/students/[id]` - Récupérer un étudiant
- `PUT /api/students/[id]` - Mettre à jour un étudiant
- `DELETE /api/students/[id]` - Supprimer un étudiant

### Setup

- `POST /api/setup` - Initialiser l'utilisateur administrateur

## 🔒 Sécurité

- Authentification basée sur les sessions JWT
- Mot de passe hashé avec bcryptjs
- Variables d'environnement sécurisées
- CSRF protection intégrée

## 🧪 Tests

```bash
# Exécuter les tests de l'API
node test-api.js
```

## 📦 Déploiement

### Vercel

1. Connectlez votre dépôt GitHub à Vercel
2. Configuration automatique des variables d'environnement
3. Le déploiement se fera automatiquement sur chaque push

### Environment Variables requises

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-a-secure-secret
```

## 📄 Licence

MIT

## 👤 Auteur

**Driss Kerbal** - d.kerbal@esisa.ac.ma

## 🔗 Liens utiles

- [GitHub Repository](https://github.com/driss-kerbal/sm)
- [Next.js Documentation](https://nextjs.org)
- [NextAuth Documentation](https://next-auth.js.org)
- [SQLite Documentation](https://www.sqlite.org)

## 💬 Support

Pour toute question ou problème, veuillez créer une issue sur GitHub.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
