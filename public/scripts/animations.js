// Function to animate the Home Page Hero Heading on scroll
export const animateHeroHeading = () => {
    gsap.from('.hero-heading', {
        scrollTrigger: {
            trigger: '.hero-heading',
            start: 'top 80%',
        },
        opacity: 0,
        scale: 0.5,
        y: -50,
        duration: 2,
        ease: 'bounce.out',
    });
};

// Function to animate About and Projects Sections on scroll
export const animateSections = () => {
    const sections = document.querySelectorAll('.about-section');

    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
            },
            opacity: 0,
            y: 50,
            duration: 1.5,
            ease: 'power2.out',
        });
    });
};

// Function to animate the Projects Heading on scroll
export const animateProjectsHeading = () => {
    const projectsHeading = document.querySelector('.projects-heading');

    gsap.from(projectsHeading, {
        scrollTrigger: {
            trigger: projectsHeading,
            start: 'top 90%',
        },
        opacity: 0,
        x: -200,
        duration: 2,
        ease: 'bounce.out',
    });
};

// Function to animate About Page Headings and Paragraphs on scroll
export const animateAboutPage = () => {
    const headings = document.querySelectorAll('h1');
    const paragraphs = document.querySelectorAll('p');

    headings.forEach((heading, index) => {
        gsap.from(heading, {
            scrollTrigger: {
                trigger: heading,
                start: 'top 80%',
            },
            opacity: 0,
            x: -50,
            duration: 1.5,
            delay: index * 0.2,
            ease: 'power3.out'
        });
    });

    paragraphs.forEach((paragraph, index) => {
        gsap.from(paragraph, {
            scrollTrigger: {
                trigger: paragraph,
                start: 'top 85%',
            },
            opacity: 0,
            y: 30,
            duration: 1.5,
            delay: index * 0.3,
            ease: 'power2.out'
        });
    });
};

// Function to animate Projects Page Sections on scroll
export const animateProjectsPage = () => {
    const projectSections = document.querySelectorAll('.about-section');

    if (projectSections.length > 0) {
        projectSections.forEach((section, index) => {
            const text = section.querySelector('.about-text');
            const image = section.querySelector('.about-image');

            if (text && image) {
                const direction = index % 2 === 0 ? -100 : 100;

                gsap.from(text, {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                    },
                    opacity: 0,
                    x: direction,
                    duration: 2.5,
                    delay: index * 0.4,
                    ease: 'expo.out',
                });

                gsap.from(image, {
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                    },
                    opacity: 0,
                    x: -direction,
                    duration: 5,
                    delay: index * 0.4,
                    ease: 'expo.out',
                });
            }
        });
    }
};
