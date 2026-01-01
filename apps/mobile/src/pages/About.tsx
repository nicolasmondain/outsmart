import React from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonAvatar,
} from '@ionic/react';
import {
  heartOutline,
  starOutline,
  codeSlashOutline,
  globeOutline,
  mailOutline,
  logoGithub,
  logoTwitter,
  logoLinkedin,
  shieldCheckmarkOutline,
  documentTextOutline,
  peopleOutline,
  rocketOutline,
  checkmarkCircleOutline,
  sparklesOutline,
} from 'ionicons/icons';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

interface Technology {
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Johnson',
    role: 'Lead Developer',
    avatar: 'SJ',
    bio: 'Full-stack developer with passion for mobile experiences',
  },
  {
    name: 'Michael Chen',
    role: 'UI/UX Designer',
    avatar: 'MC',
    bio: 'Creating beautiful and intuitive user interfaces',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager',
    avatar: 'ER',
    bio: 'Bridging the gap between users and technology',
  },
  {
    name: 'David Kim',
    role: 'Backend Engineer',
    avatar: 'DK',
    bio: 'Building scalable and robust server architectures',
  },
];

const technologies: Technology[] = [
  {
    name: 'React',
    description: 'Modern JavaScript library for building user interfaces',
    icon: codeSlashOutline,
    color: 'text-blue-600',
  },
  {
    name: 'Ionic',
    description: 'Cross-platform mobile app development framework',
    icon: rocketOutline,
    color: 'text-indigo-600',
  },
  {
    name: 'Capacitor',
    description: 'Native bridge for web apps to access device features',
    icon: shieldCheckmarkOutline,
    color: 'text-green-600',
  },
  {
    name: 'TypeScript',
    description: 'Type-safe JavaScript for better development experience',
    icon: checkmarkCircleOutline,
    color: 'text-purple-600',
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development',
    icon: sparklesOutline,
    color: 'text-cyan-600',
  },
];

const stats: Stat[] = [
  {
    label: 'Active Users',
    value: '50K+',
    icon: peopleOutline,
    color: 'text-blue-600',
  },
  {
    label: 'App Store Rating',
    value: '4.8',
    icon: starOutline,
    color: 'text-yellow-600',
  },
  {
    label: 'Countries',
    value: '25+',
    icon: globeOutline,
    color: 'text-green-600',
  },
  {
    label: 'Updates',
    value: '150+',
    icon: rocketOutline,
    color: 'text-purple-600',
  },
];

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-white border-b border-gray-200">
          <IonButtons slot="start">
            <IonMenuButton className="text-gray-600" />
          </IonButtons>
          <IonTitle className="text-gray-900 font-semibold">
            About
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-6 py-16 text-white">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold">OS</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Outsmart
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-6">
              Your intelligent companion for productivity, innovation, and staying ahead of the curve.
            </p>
            <IonBadge className="bg-white/20 text-white px-4 py-2 rounded-full text-sm">
              Version 1.2.0
            </IonBadge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-4 -mt-8 mb-8">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center`}>
                    <IonIcon icon={stat.icon} className={`text-lg ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pb-8">
          {/* Mission Statement */}
          <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
            <IonCardHeader>
              <IonCardTitle className="flex items-center space-x-3">
                <IonIcon icon={heartOutline} className="text-red-500 text-xl" />
                <span>Our Mission</span>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p className="text-gray-600 leading-relaxed">
                We believe in empowering individuals and teams to achieve more through intelligent technology.
                Outsmart combines cutting-edge AI with intuitive design to create tools that adapt to your workflow,
                not the other way around.
              </p>
            </IonCardContent>
          </IonCard>

          {/* Features */}
          <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
            <IonCardHeader>
              <IonCardTitle className="flex items-center space-x-3">
                <IonIcon icon={sparklesOutline} className="text-blue-500 text-xl" />
                <span>What Makes Us Different</span>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">AI-Powered Intelligence</h4>
                  <p className="text-sm text-gray-600">Smart automation that learns from your behavior</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Privacy First</h4>
                  <p className="text-sm text-gray-600">Your data stays secure and private, always</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Cross-Platform</h4>
                  <p className="text-sm text-gray-600">Seamless experience across all your devices</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Open Source</h4>
                  <p className="text-sm text-gray-600">Built with transparency and community in mind</p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Technology Stack */}
          <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
            <IonCardHeader>
              <IonCardTitle className="flex items-center space-x-3">
                <IonIcon icon={codeSlashOutline} className="text-green-500 text-xl" />
                <span>Built With</span>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="space-y-4">
                {technologies.map((tech, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <IonIcon icon={tech.icon} className={`text-lg ${tech.color}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{tech.name}</h4>
                      <p className="text-sm text-gray-600">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Team */}
          <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
            <IonCardHeader>
              <IonCardTitle className="flex items-center space-x-3">
                <IonIcon icon={peopleOutline} className="text-purple-500 text-xl" />
                <span>Meet the Team</span>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="grid grid-cols-2 gap-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center">
                    <IonAvatar className="w-16 h-16 mx-auto mb-3">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{member.avatar}</span>
                      </div>
                    </IonAvatar>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{member.name}</h4>
                    <p className="text-xs text-blue-600 mb-2">{member.role}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{member.bio}</p>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Contact & Links */}
          <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
            <IonCardHeader>
              <IonCardTitle className="flex items-center space-x-3">
                <IonIcon icon={mailOutline} className="text-indigo-500 text-xl" />
                <span>Get in Touch</span>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList className="bg-transparent">
                <IonItem button className="mb-1 rounded-lg">
                  <IonIcon icon={mailOutline} slot="start" className="text-gray-500" />
                  <IonLabel>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-sm text-gray-500">hello@outsmart.app</p>
                  </IonLabel>
                </IonItem>
                <IonItem button className="mb-1 rounded-lg">
                  <IonIcon icon={globeOutline} slot="start" className="text-gray-500" />
                  <IonLabel>
                    <h3 className="font-medium text-gray-900">Website</h3>
                    <p className="text-sm text-gray-500">www.outsmart.app</p>
                  </IonLabel>
                </IonItem>
                <IonItem button className="mb-1 rounded-lg">
                  <IonIcon icon={logoGithub} slot="start" className="text-gray-500" />
                  <IonLabel>
                    <h3 className="font-medium text-gray-900">GitHub</h3>
                    <p className="text-sm text-gray-500">github.com/outsmart</p>
                  </IonLabel>
                </IonItem>
                <IonItem button className="rounded-lg">
                  <IonIcon icon={logoTwitter} slot="start" className="text-gray-500" />
                  <IonLabel>
                    <h3 className="font-medium text-gray-900">Twitter</h3>
                    <p className="text-sm text-gray-500">@outsmart_app</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Legal */}
          <IonCard className="shadow-soft border border-gray-200 rounded-xl overflow-hidden mb-6">
            <IonCardHeader>
              <IonCardTitle className="flex items-center space-x-3">
                <IonIcon icon={documentTextOutline} className="text-gray-500 text-xl" />
                <span>Legal</span>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList className="bg-transparent">
                <IonItem button className="mb-1 rounded-lg">
                  <IonIcon icon={documentTextOutline} slot="start" className="text-gray-500" />
                  <IonLabel>
                    <h3 className="font-medium text-gray-900">Privacy Policy</h3>
                    <p className="text-sm text-gray-500">How we handle your data</p>
                  </IonLabel>
                </IonItem>
                <IonItem button className="mb-1 rounded-lg">
                  <IonIcon icon={documentTextOutline} slot="start" className="text-gray-500" />
                  <IonLabel>
                    <h3 className="font-medium text-gray-900">Terms of Service</h3>
                    <p className="text-sm text-gray-500">Our terms and conditions</p>
                  </IonLabel>
                </IonItem>
                <IonItem button className="rounded-lg">
                  <IonIcon icon={shieldCheckmarkOutline} slot="start" className="text-gray-500" />
                  <IonLabel>
                    <h3 className="font-medium text-gray-900">Open Source Licenses</h3>
                    <p className="text-sm text-gray-500">Third-party acknowledgments</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Footer */}
        <div className="px-4 pb-8">
          <div className="text-center text-gray-400 text-sm space-y-2">
            <p>Made with ❤️ by the Outsmart Team</p>
            <p>© 2024 Outsmart. All rights reserved.</p>
            <div className="flex justify-center space-x-4 pt-4">
              <IonButton fill="clear" size="small" className="text-gray-400">
                <IonIcon icon={logoGithub} />
              </IonButton>
              <IonButton fill="clear" size="small" className="text-gray-400">
                <IonIcon icon={logoTwitter} />
              </IonButton>
              <IonButton fill="clear" size="small" className="text-gray-400">
                <IonIcon icon={logoLinkedin} />
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;
