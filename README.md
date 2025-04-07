# Dokusho

<div align="center">
  <img src="src/assets/dokusho.png" alt="Dokusho Logo" width="180" height="180">
  <h3>Modern manga reader built with Tauri and React</h3>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Beta Release](https://img.shields.io/badge/release-beta_coming_soon-orange)
[![Tauri](https://img.shields.io/badge/tauri-2.x-blue)](https://tauri.app)
[![React](https://img.shields.io/badge/react-18.x-blue)](https://reactjs.org/)
</div>

## 📖 Overview

Dokusho is a modern, cross-platform manga reader application that provides a seamless reading experience with library management features. Built with performance and user experience in mind, it leverages Tauri's native capabilities while providing a beautiful React interface.

**Beta release scheduled for May 22, 2025.**

## ✨ Features

- 📚 Comprehensive manga library management
- 🔄 Multiple reading modes (left-to-right, right-to-left, vertical, webtoon)
- 🔍 Advanced search and filtering capabilities
- 📱 Cross-platform support (Windows, macOS, Linux)
- 🚀 Fast, native performance with small app size
- 🧩 Extensible architecture with plugin support
- 🎨 Customizable user interface
- 🔄 Chapter tracking and progress synchronization
- 📊 Reading statistics and history
- 🌙 Light and dark mode support

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [pnpm](https://pnpm.io/installation) (v8 or higher)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/dokushoapp/dokusho.git
   cd dokusho
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm tauri dev
   ```

### Building for Production

```bash
pnpm tauri build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle` directory.

## 🛠️ Tech Stack

- **Frontend**:
    - [React](https://reactjs.org/)
    - [Tailwind CSS](https://tailwindcss.com/) with shadcn/ui components

- **Backend**:
    - [Tauri](https://tauri.app/) (Rust-based native framework)
    - [Rust](https://www.rust-lang.org/)

- **Build Tools**:
    - [Vite](https://vitejs.dev/)
    - [pnpm](https://pnpm.io/) (Package manager)

## 📋 Development Roadmap

| Phase | Timeline | Status |
|-------|----------|--------|
| Initial Design | Jan 2025 | ✅ Completed |
| Core Development | Feb-Apr 2025 | ✅ Completed |
| Extension System | Apr 2025 | 🔄 In Progress |
| Beta Release | May 22, 2025 | 🔜 Upcoming |
| Public Release | July 2025 | 📅 Planned |
| Mobile App | Q4 2025 | 📅 Planned |

## 🤝 Contributing

We welcome contributions to Dokusho! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🔗 Links

- [Website](https://dokusho.app)
- [Documentation](https://docs.dokusho.app)
- [GitHub Repository](https://github.com/dokushoapp/dokusho)
- [Issue Tracker](https://github.com/dokushoapp/dokusho/issues)

---

<div align="center">
  <p>Built with ❤️ by the Dokusho team</p>
  <p>© 2025 Dokusho</p>
</div>