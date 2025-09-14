# Contributing to Hyperfocus Zone 🚀

Thanks for your interest in contributing to **Hyperfocus Zone**! This project is built **by and for the neurodivergent community**, and we welcome all contributions that make gaming more accessible and engaging.

## 🎯 **Our Mission**
To create the ultimate puzzle gaming experience that celebrates neurodivergent visual-spatial intelligence and provides confidence-building challenges without barriers.

---

## 🤝 **How to Contribute**

### **🎨 Theme Designers**
Create new visual worlds and puzzle box themes:
- Design cohesive visual languages (colors, materials, effects)
- Create theme-specific puzzle mechanics
- Ensure high contrast and dyslexia-friendly palettes
- Submit concepts via GitHub issues with mockups/sketches

### **🧩 Puzzle Mechanics Creators**
Develop new visual puzzle types:
- Focus on **spatial reasoning**, **pattern recognition**, or **visual memory**
- Ensure **zero text dependency**
- Create progressive difficulty curves
- Test with neurodivergent players for feedback

### **♿ Accessibility Advocates**
Improve usability for all neurodivergent players:
- Audit existing features for accessibility barriers
- Suggest new accommodations (motor, visual, auditory, cognitive)
- Test with assistive technologies
- Document accessibility features and improvements

### **🧪 Researchers & Educators**
Contribute scientific backing and educational value:
- Share research on neurodivergent gaming benefits
- Suggest evidence-based design improvements  
- Create educational documentation about visual-spatial strengths
- Develop assessment tools for cognitive benefits

### **🎵 Audio Artists**
Craft immersive soundscapes and musical feedback:
- Design theme-specific musical instruments and tones
- Create accessible audio alternatives to visual cues
- Develop dynamic music systems that respond to gameplay
- Ensure audio works well for sensory-sensitive players

### **💻 Developers**
Improve the technical foundation:
- Optimize performance for older devices
- Add new puzzle engine features
- Improve mobile touch controls
- Enhance offline capabilities

---

## 📋 **Contribution Guidelines**

### **Before You Start**
1. **Check existing issues** and discussions to avoid duplication
2. **Open an issue** to discuss major changes before coding
3. **Join our Discord** for real-time collaboration
4. **Review our accessibility principles** below

### **Our Accessibility Principles**
- **Visual First** - Every interaction must be understandable without text
- **High Contrast** - All visual elements must meet WCAG AAA standards  
- **Large Targets** - Touch targets minimum 60px for motor accessibility
- **Customizable Speed** - Accommodate different processing speeds
- **Multi-Sensory** - Provide audio, visual, and haptic feedback options
- **Error Forgiveness** - Allow unlimited attempts without punishment

### **Code Style Guidelines**
```javascript
// Use descriptive variable names that explain purpose
const rotationAngleTarget = 45; // Good
const ra = 45; // Avoid

// Comment complex neurodivergent-specific accommodations
// This delay accounts for processing time differences in ADHD
const hintDelay = 45000; 

// Use semantic HTML for screen reader compatibility
<button aria-label="Rotate puzzle clockwise" class="rotation-control">
    <RotateIcon />
</button>
```

### **Testing Requirements**
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Cross-device**: Desktop, tablet, mobile
- **Accessibility**: Screen readers, keyboard navigation, high contrast mode
- **Neurodivergent feedback**: Test with ADHD and dyslexic community members

---

## 🛠️ **Development Setup**

### **Local Environment**
```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/hyperfocus-zone.git
cd hyperfocus-zone

# Create feature branch
git checkout -b feature/amazing-new-puzzle

# Start local server
python -m http.server 8000
# or
npx http-server

# Navigate to http://localhost:8000
```

### **Project Structure Deep Dive**
```
hyperfocus-zone/
├── index.html              # Entry point with semantic HTML
├── app.js                  # Main game engine
│   ├── UltimateMindVault   # Core game class
│   ├── PuzzleSystem        # Puzzle mechanics engine
│   ├── AudioSystem         # Web Audio API integration
│   ├── ParticleSystem      # Visual effects engine
│   └── AccessibilityLayer  # WCAG compliance features
├── style.css               # Dyslexia-optimized styling
│   ├── Color tokens        # High contrast palettes
│   ├── Touch targets       # Mobile accessibility
│   ├── Animation controls  # Speed customization
│   └── Focus indicators    # Keyboard navigation
└── assets/
    ├── themes/             # Visual theme definitions
    ├── puzzles/            # Puzzle configuration files
    └── audio/              # Sound synthesis presets
```

---

## 📝 **Pull Request Process**

### **1. Pre-PR Checklist**
- [ ] Code follows our accessibility principles
- [ ] All features work without text/reading
- [ ] High contrast mode compatibility verified
- [ ] Touch targets meet 60px minimum
- [ ] Cross-browser testing completed
- [ ] Performance impact assessed (60fps maintenance)

### **2. PR Description Template**
```markdown
## What This PR Does
Brief description of the change and why it's needed.

## Accessibility Impact
- [ ] Maintains zero text dependency
- [ ] High contrast compatible
- [ ] Touch accessibility preserved
- [ ] Screen reader friendly

## Neurodivergent Community Benefit
How this change specifically helps ADHD/dyslexic players.

## Testing Done
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Mobile devices (iOS, Android)  
- [ ] Accessibility tools (screen readers, keyboard nav)
- [ ] Community feedback (link to Discord discussion)

## Screenshots/GIFs
Visual demonstration of the change in action.
```

### **3. Review Process**
- **Automated checks** run for accessibility and performance
- **Community review** period (48-72 hours)
- **Maintainer approval** focuses on neurodivergent impact
- **Merge** after all checks pass and community feedback incorporated

---

## 🏆 **Recognition System**

### **Contributor Levels**
- **🌟 Community Star** - First contribution merged
- **⚡ Accessibility Champion** - 3+ accessibility improvements
- **🧩 Puzzle Master** - 5+ new puzzle mechanics added
- **🎨 Theme Artist** - Complete theme contribution
- **🧠 Research Partner** - Scientific backing contributions
- **💎 Core Team** - 10+ significant contributions

### **Hall of Fame**
Contributors who significantly advance neurodivergent gaming accessibility are featured in:
- **README Hall of Fame** section
- **In-game credits** system
- **Community Discord** special roles
- **Conference speaking** opportunities

---

## 📚 **Resources for Contributors**

### **Neurodivergent Gaming Research**
- [Dyslexic Visual Strengths Studies](link-to-research)
- [ADHD Hyperfocus Gaming Benefits](link-to-research)  
- [Accessibility in Puzzle Games](link-to-research)
- [Visual-Spatial Intelligence Research](link-to-research)

### **Technical Documentation**
- [Three.js 3D Graphics Guide](https://threejs.org/docs/)
- [Web Audio API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Progressive Web App Standards](https://web.dev/progressive-web-apps/)

### **Design Resources**
- [Dyslexia-Friendly Color Palettes](link-to-palettes)
- [High Contrast Design Principles](link-to-principles)
- [Touch Target Size Guidelines](link-to-guidelines)
- [Cognitive Load Reduction Techniques](link-to-techniques)

---

## 🚨 **Code of Conduct**

### **Our Values**
- **Neurodiversity Celebration** - All neurotypes are valued and respected
- **Accessibility First** - No feature ships without accessibility consideration
- **Community Driven** - Decisions made with community input
- **Scientific Backing** - Changes grounded in research when possible
- **Inclusive Language** - Communication accessible to all cognitive styles

### **Expected Behavior**
- Use person-first language ("person with dyslexia" not "dyslexic person")
- Acknowledge neurodivergent strengths, not just accommodations
- Provide context and clear communication for executive function differences
- Be patient with different communication and processing styles
- Celebrate unique perspectives and problem-solving approaches

### **Unacceptable Behavior**
- Ableist language or assumptions about cognitive abilities
- Dismissing accessibility concerns as "edge cases"
- Gatekeeping contributions based on neurotype
- Adding text-dependent features without visual alternatives

---

## ❓ **Questions & Support**

### **Where to Get Help**
- **🐛 Bug reports**: GitHub Issues
- **💡 Feature ideas**: GitHub Discussions
- **🤝 Collaboration**: Discord #contributors channel
- **📧 Private concerns**: Email maintainers directly

### **Response Times**
- **Critical accessibility bugs**: 24 hours
- **Community questions**: 48-72 hours  
- **Feature discussions**: Weekly community calls
- **PR reviews**: 3-5 business days

---

## 🎉 **Getting Started Today**

### **Quick Contribution Ideas**
1. **Test the game** with assistive technologies and report findings
2. **Share neurodivergent gaming experiences** in GitHub Discussions
3. **Suggest new puzzle mechanics** based on visual-spatial strengths
4. **Create color palette variations** for different visual needs
5. **Document accessibility features** for new users
6. **Translate documentation** (visual aids, not text!)

### **First-Time Contributor Path**
1. **Play the game** and identify one thing that could be improved
2. **Check GitHub issues** to see if it's already reported
3. **Join Discord** and introduce yourself in #new-contributors
4. **Start with documentation** or minor UI improvements
5. **Work up to puzzle mechanics** and core features

---

<div align="center">

### 🚀 **Ready to Build the Future of Neurodivergent Gaming?**

[![Join Discord](https://img.shields.io/badge/Discord-Join_Community-5865F2?style=for-the-badge&logo=discord)](https://discord.gg/hyperfocus-zone)
[![View Issues](https://img.shields.io/badge/GitHub-Good_First_Issues-28a745?style=for-the-badge&logo=github)](https://github.com/yourusername/hyperfocus-zone/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

**Every contribution makes gaming more accessible for neurodivergent minds worldwide** 🧩

</div>