# Git Operations Module

Dieses Modul bietet eine vollständige Git-Integration für das PIDEA-Spark Automation System mit WorkspaceFinder-Unterstützung.

## 📁 **Dateistruktur**

```
automation/git-operations/
├── find-git.js          # Git-Repository-Erkennung via CDP
├── run.js               # Haupt-Git-Operations-Manager
├── git-status.js        # Git-Status-Checker
├── git-branches.js      # Git-Branch-Management
├── git-commit.js        # Git-Commit-Operationen (add, commit, push, pull, fetch)
├── git-stash.js         # Git-Stash-Management
├── git-reset.js         # Git-Reset-Operationen (soft, hard, mixed)
├── git-remote.js        # Git-Remote-Management
└── README.md           # Diese Datei
```

## 🎯 **Funktionen**

### **1. WorkspaceFinder-Integration**
- Automatische Erkennung des Cursor Workspace
- Git-Operationen im korrekten Repository
- Fallback auf lokales Verzeichnis

### **2. Git-Status-Checker (`git-status.js`)**
```javascript
const GitStatusChecker = new GitStatusChecker(workspacePath);
const status = await gitChecker.getStatus();
const branch = await gitChecker.getCurrentBranch();
const info = await gitChecker.getFullInfo();
```

**Features:**
- ✅ Git-Repository-Erkennung
- 📊 Detaillierter Status (modified, added, deleted, untracked)
- 🌿 Branch-Informationen
- 📝 Commit-Historie
- 🌐 Remote-Repository-Info

### **3. Git-Branch-Manager (`git-branches.js`)**
```javascript
const GitBranchManager = new GitBranchManager(workspacePath);
const branches = await branchManager.getAllBranches();
const result = await branchManager.createBranch('feature/new-feature');
const result = await branchManager.switchBranch('main');
```

**Features:**
- 📋 Alle Branches auflisten (local + remote)
- ➕ Neue Branches erstellen
- 🔄 Branch wechseln
- 🗑️ Branches löschen
- 🔀 Branches mergen
- 📊 Branch-Informationen

### **4. Git-Commit-Manager (`git-commit.js`)**
```javascript
const GitCommitManager = new GitCommitManager(workspacePath);
const result = await commitManager.addFiles(['file1.js', 'file2.js']);
const result = await commitManager.commit('Add new feature');
const result = await commitManager.push();
const result = await commitManager.pull();
const result = await commitManager.fetch();
```

**Features:**
- 📁 Dateien zum Staging hinzufügen
- 💾 Commits erstellen
- 🚀 Push/Pull/Fetch-Operationen
- 📝 Commit-Historie
- 🔍 Diff-Ansicht
- ⚡ Add-Commit-Push Workflow

### **5. Git-Stash-Manager (`git-stash.js`)**
```javascript
const GitStashManager = new GitStashManager(workspacePath);
const result = await stashManager.stash('WIP: feature in progress');
const result = await stashManager.stashPop();
const stashes = await stashManager.stashList();
```

**Features:**
- 📦 Änderungen stashen
- 🔄 Stash anwenden (pop/apply)
- 📋 Stash-Liste
- 🗑️ Stash löschen
- 🌿 Branch aus Stash erstellen
- 📁 Spezifische Dateien stashen

### **6. Git-Reset-Manager (`git-reset.js`)**
```javascript
const GitResetManager = new GitResetManager(workspacePath);
const result = await resetManager.softReset('HEAD~1');
const result = await resetManager.hardReset('HEAD~1');
const result = await resetManager.mixedReset('HEAD~1');
const result = await resetManager.revertCommit('abc123');
```

**Features:**
- 🔄 Soft Reset (Änderungen behalten)
- 🗑️ Hard Reset (Änderungen verwerfen)
- 🔀 Mixed Reset (Standard)
- ↩️ Commit revertieren
- 📋 Reflog für Recovery
- 🛡️ Reset-Sicherheitsprüfung

### **7. Git-Remote-Manager (`git-remote.js`)**
```javascript
const GitRemoteManager = new GitRemoteManager(workspacePath);
const remotes = await remoteManager.listRemotes();
const result = await remoteManager.addRemote('upstream', 'https://github.com/user/repo.git');
const result = await remoteManager.setRemoteUrl('origin', 'https://github.com/user/repo.git');
```

**Features:**
- 🌐 Remote-Repositories verwalten
- ➕ Remote hinzufügen/entfernen
- 🔄 Remote-URL ändern
- 📋 Remote-Branches auflisten
- 🔗 Upstream-Branches setzen
- 📊 Remote-Status (ahead/behind)

### **8. Git-Operations-Manager (`run.js`)**
```javascript
const GitOperationsManager = new GitOperationsManager(config, log);
await gitManager.initialize();
const result = await gitManager.addFiles(['file1.js', 'file2.js']);
const result = await gitManager.commit('Add new feature');
const result = await gitManager.push();
```

**Features:**
- 🎯 Zentrale Git-Verwaltung
- 🔗 WorkspaceFinder-Integration
- 📊 Vollständige Git-Info
- 🚀 Automatisierte Workflows

## 🚀 **Verwendung**

### **In der Hauptworkflow-Datei (`pidea-spark.js`)**

```javascript
// Git-Status prüfen
const gitStatus = await this.checkGitStatus();

// Branches auflisten
const branches = await this.getGitBranches();

// Neuen Branch erstellen
const result = await this.createGitBranch('feature/new-feature');

// Branch wechseln
const result = await this.switchGitBranch('main');

// Änderungen committen und pushen
const result = await this.commitAndPush('Add new feature', ['file1.js']);
```

### **Standalone-Verwendung**

```javascript
// Git-Status prüfen
import GitStatusChecker from './automation/git-operations/git-status.js';
const checker = new GitStatusChecker('/path/to/workspace');
const info = await checker.getFullInfo();

// Branch-Management
import GitBranchManager from './automation/git-operations/git-branches.js';
const branchManager = new GitBranchManager('/path/to/workspace');
const branches = await branchManager.getAllBranches();

// Commit-Operationen
import GitCommitManager from './automation/git-operations/git-commit.js';
const commitManager = new GitCommitManager('/path/to/workspace');
const result = await commitManager.addCommitPush(['file1.js'], 'Update feature');

// Stash-Operationen
import GitStashManager from './automation/git-operations/git-stash.js';
const stashManager = new GitStashManager('/path/to/workspace');
const result = await stashManager.stash('WIP: feature in progress');

// Reset-Operationen
import GitResetManager from './automation/git-operations/git-reset.js';
const resetManager = new GitResetManager('/path/to/workspace');
const result = await resetManager.softReset('HEAD~1');

// Remote-Operationen
import GitRemoteManager from './automation/git-operations/git-remote.js';
const remoteManager = new GitRemoteManager('/path/to/workspace');
const remotes = await remoteManager.listRemotes();
```

## 📊 **Beispiel-Ausgaben**

### **Git-Status-Check:**
```
🔍 Checking Git status...
✅ Git repository found in: /home/user/cursor-workspace
📋 Current branch: main
📊 Status: 3 changes
⚠️ Repository has uncommitted changes
   Modified: 2
   Added: 1
   Deleted: 0
   Untracked: 0
```

### **Branch-Liste:**
```
🌿 Getting Git branches...
✅ Found 3 local and 5 remote branches
📋 Current branch: main

📋 Local Branches:
→ main
  feature/new-feature
  bugfix/issue-123

🌐 Remote Branches:
  develop
  staging
  release/v1.0.0
```

### **Commit-Operationen:**
```
💾 Committing and pushing changes...
✅ Added files to staging: file1.js file2.js
✅ Committed with message: Add new feature
✅ Pushed to remote origin
```

### **Stash-Operationen:**
```
📦 Git Stash Operations Test:
==============================
Has stashes: true
📦 Found 2 stashes

📋 Stash list:
  stash@{0}: WIP: feature in progress
  stash@{1}: WIP: bugfix work
```

### **Reset-Operationen:**
```
🔄 Git Reset Operations Test:
=============================
📋 Current commit: abc1234
🛡️ Reset safe: false
⚠️ Has uncommitted changes - reset may be dangerous

📝 Recent commits:
  0: abc1234 Update feature
  1: def5678 Fix bug
  2: ghi9012 Initial commit
```

### **Remote-Operationen:**
```
🌐 Git Remote Operations Test:
==============================
📋 Found 2 remotes:
  origin:
    fetch: https://github.com/user/repo.git
    push: https://github.com/user/repo.git
  upstream:
    fetch: https://github.com/original/repo.git
    push: https://github.com/original/repo.git

📊 Remote status:
  Branch: main
  Ahead: 2
  Behind: 0

🌿 Remote branches (origin): 5
  origin/main
  origin/develop
  origin/feature/new-feature
```

## 🔧 **Konfiguration**

### **WorkspaceFinder-Integration**
```javascript
const config = {
    cdpPort: 9222,  // Cursor CDP Port
    projectRoot: '/path/to/workspace'
};
```

### **Logging**
```javascript
const log = (message, level = 'INFO') => {
    console.log(`[${level}] ${message}`);
};
```

## 🛡️ **Fehlerbehandlung**

Alle Module bieten robuste Fehlerbehandlung:

```javascript
const result = await gitManager.createBranch('test');
if (result.error) {
    console.log(`❌ Error: ${result.error}`);
} else {
    console.log(`✅ Success: ${result.message}`);
}
```

## 🔄 **WorkspaceFinder-Integration**

Das System erkennt automatisch das Cursor Workspace:

1. **Workspace gefunden**: Git-Operationen im korrekten Repository
2. **Kein Workspace**: Fallback auf lokales Verzeichnis
3. **Cursor nicht erreichbar**: Automatischer Fallback

## 📝 **Beispiele für Automation-Workflows**

### **Automatisches Committing nach Task-Abschluss:**
```javascript
// Nach erfolgreicher Task-Ausführung
const gitStatus = await this.checkGitStatus();
if (gitStatus.isGitRepo && gitStatus.status.status.total > 0) {
    await this.commitAndPush(`Complete task: ${task.name}`);
}
```

### **Feature-Branch-Workflow:**
```javascript
// Neuen Feature-Branch erstellen
await this.createGitBranch(`feature/${task.name}`);

// Task ausführen
await this.executeTask(task);

// Änderungen committen
await this.commitAndPush(`Implement ${task.name}`);

// Zurück zu main
await this.switchGitBranch('main');
```

### **Stash-Workflow für Konflikte:**
```javascript
// Änderungen stashen
const stashResult = await stashManager.stash('WIP: before pull');

// Pull ausführen
const pullResult = await commitManager.pull();

// Stash wieder anwenden
const popResult = await stashManager.stashPop();
```

### **Reset-Workflow für Fehlerbehebung:**
```javascript
// Prüfen ob Reset sicher ist
const resetSafety = await resetManager.isResetSafe();

if (resetSafety.isSafe) {
    // Soft reset für letzte Änderungen
    await resetManager.softReset('HEAD~1');
} else {
    // Stash erstellen vor Reset
    await stashManager.stash('Before reset');
    await resetManager.hardReset('HEAD~1');
}
```

### **Remote-Workflow für Upstream-Updates:**
```javascript
// Upstream hinzufügen
await remoteManager.addRemote('upstream', 'https://github.com/original/repo.git');

// Fetch von Upstream
await remoteManager.fetchRemote('upstream');

// Branch erstellen für Update
await branchManager.createBranch('update-from-upstream');

// Merge von Upstream
await branchManager.mergeBranch('upstream/main');
```

## 🎉 **Vorteile**

- ✅ **Workspace-aware**: Funktioniert im korrekten Cursor Workspace
- 🔄 **Rückwärtskompatibel**: Fallback auf lokales Verzeichnis
- 📊 **Detaillierte Informationen**: Umfassende Git-Status-Info
- 🛡️ **Robuste Fehlerbehandlung**: Graceful Degradation
- 🚀 **Einfache Integration**: Plug-and-play in bestehende Workflows
- 📝 **Umfassende Dokumentation**: Klare API und Beispiele
- 🎯 **Modulare Architektur**: Jede Operation in separater Datei
- ⚡ **Vollständige Git-Unterstützung**: Alle wichtigen Git-Befehle
- 🔗 **WorkspaceFinder-Integration**: Automatische Workspace-Erkennung

## 📋 **Git-Befehle Übersicht**

### **Basis-Operationen:**
- `git status` → `GitStatusChecker.getStatus()`
- `git add` → `GitCommitManager.addFiles()`
- `git commit` → `GitCommitManager.commit()`
- `git push` → `GitCommitManager.push()`
- `git pull` → `GitCommitManager.pull()`
- `git fetch` → `GitCommitManager.fetch()`

### **Branch-Operationen:**
- `git branch` → `GitBranchManager.getAllBranches()`
- `git checkout -b` → `GitBranchManager.createBranch()`
- `git checkout` → `GitBranchManager.switchBranch()`
- `git merge` → `GitBranchManager.mergeBranch()`

### **Stash-Operationen:**
- `git stash` → `GitStashManager.stash()`
- `git stash pop` → `GitStashManager.stashPop()`
- `git stash list` → `GitStashManager.stashList()`

### **Reset-Operationen:**
- `git reset --soft` → `GitResetManager.softReset()`
- `git reset --hard` → `GitResetManager.hardReset()`
- `git reset --mixed` → `GitResetManager.mixedReset()`
- `git revert` → `GitResetManager.revertCommit()`

### **Remote-Operationen:**
- `git remote -v` → `GitRemoteManager.listRemotes()`
- `git remote add` → `GitRemoteManager.addRemote()`
- `git remote set-url` → `GitRemoteManager.setRemoteUrl()`
- `git fetch` → `GitRemoteManager.fetchRemote()`

---

**Hinweis**: Alle Git-Operationen verwenden `execSync` für synchrone Ausführung und bessere Integration in Automation-Workflows. 