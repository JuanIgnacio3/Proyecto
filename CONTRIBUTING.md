# 🤝 Contributing to Tailwind Admin Templates

Thank you for your interest in contributing 🎉  
This repository contains **Tailwind CSS–based Admin Dashboard Templates (Free Version)** for multiple frameworks.  
We welcome contributions of all kinds — bug fixes, UI improvements, documentation updates, and new ideas.

---

## 📦 Templates in This Repository

Each template is maintained as a **standalone project**:

- **Angular** – `tailwind-admin-angular-free`
- **HTML** – `tailwind-admin-html-free`
- **Next.js** – `tailwind-admin-nextjs-free`
- **React** – `tailwind-admin-reactjs-free`
- **Vue.js** – `tailwind-admin-vuejs-free`
- **Tanstack Start** – `tailwind-admin-tanstack-start/package`

You only need to work on **one template at a time**.

---

### 🛠️ How to Contribute

Follow these simple steps to start contributing:

1. **Fork the Repository**  
   Click the **Fork** button on the top-right corner of this repo to create your own copy.

2. **Clone Your Fork**  
   Use the command below to clone your forked repository:
   ```bash
   git clone https://github.com/Tailwind-Admin/Tailwind-admin-free.git

3. **Create a New Branch**  
   Create a new branch to work on your feature or fix. This keeps your changes separate from the main branch:
   ```bash
   git checkout -b your-template/feature/your-feature-name
   ```

Example:

   ```bash
   git checkout -b nextjs/feature/your-feature-name
   ```

4. **Make Your Changes**

Work only inside the relevant template and its packages/ folder.

5. **Commit and Push Changes**  
   After making your changes, commit them with a meaningful message and push your branch to your fork:
   ```bash
   git commit -am "Add[template-name]: Description of changes made"
   git commit -am "fix[template-name]: describe your changes"
   git push origin nextjs/feature/your-feature-name

6. **Open a Pull Request**

Open a PR to the main branch with a clear description of your changes.

---

## 📁 Folder Structure (Very Important)
```
Tailwind-Admin
├── tailwind-admin-angular-free/       # Angular 
│ └── packages/
├── tailwind-admin-html-free/          # HTML
│ └── packages/
├── tailwind-admin-nextjs-free/        # Next Js
│ └── packages/
├── tailwind-admin-reactjs-free/       # React 
│ └── packages/
├── tailwind-admin-vuejs-free/         # Vue Js
│ └── packages/
├── tailwind-admin-tanstack-start/package/  # Tanstack Start
│ └── packages/
├── .github/
├── README.md
├── CONTRIBUTING.md
├── LICENSE.md
└── SECURITY.md
```

---

## ❗ Folder Structure Rules (Please Read)

- Do not rename, move, or delete any template folder
- Do not remove, rename, or restructure the `packages/` folder
- The `packages/` folder contains core template code
- Each template must remain standalone

Pull requests that change the folder structure may be rejected.

---

## 🧑‍💻 Working Inside `packages/`

All code changes must be made inside the `packages/` folder of the relevant template.

### Allowed
- Bug fixes
- UI / UX improvements
- Tailwind CSS refinements
- Adding or improving components
- Safe refactoring (without breaking structure)

### Not Allowed
- Moving code outside `packages/`
- Sharing code between templates
- Adding root-level shared packages

---

## 🎯 Framework-Specific Contributions

You only need to work on one template at a time.

Example:
```
tailwind-admin-reactjs-free/packages/
```

You do NOT need to update all templates in one pull request.

---

## 🔄 Cross-Framework Changes (Optional)

If a change is generic(layout idea, spacing improvement, component behavior):
- You may apply it to multiple templates — but this is optional.
- If you update only one template, please mention it clearly in the PR description.

---

## 🎨 Tailwind CSS Guidelines
- Prefer Tailwind utility classes
- Avoid inline styles
- Keep spacing, typography, and colors consistent
- Reuse existing patterns where possible

## 📝 Commit Message Guidelines
Use clear and descriptive commit messages:

`
feat(react): add collapsible sidebar
fix(nextjs): fix navbar hydration issue
docs: update contributing guide
`

## 📦 Pull Request Guidelines

Before submitting a PR:
- ✅ Changes are tested locally
- ✅ PR is focused and minimal
- ✅ Folder structure is unchanged
- ✅ Screenshots or videos are added for UI changes (recommended)


PR Title Format

```csharp
[Framework] Short description
```

Example:

```csharp
[React] Improve dashboard spacing
```

## 🐛 Reporting Issues

Include:
- Template name (Angular / HTML / Next.js / React / Vue / Tanstack Start)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings (if applicable)

## ❤️ Thank You

We truly appreciate your time and contributions.
Your help makes these templates better for everyone 🚀

