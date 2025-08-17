# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an e-mail to the maintainer. All security vulnerabilities will be promptly addressed.

Please do not create public issues for security vulnerabilities.

### What to include in your report

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if available)

### What to expect

- Acknowledgment of your report within 48 hours
- Regular updates on our progress
- Credit in the security advisory (if desired)

## Security Best Practices

When using this library:

1. Keep dependencies up to date
2. Use the latest stable version
3. Follow the principle of least privilege
4. Validate all inputs when using CLI features
5. Review generated code before committing

## Automated Security Measures

This project includes:

- Automated dependency vulnerability scanning
- Code security analysis with ESLint security rules
- Regular dependency updates via Dependabot
- Secure CI/CD pipeline with minimal permissions
