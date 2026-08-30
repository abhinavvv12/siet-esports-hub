import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import PublicLayout from '../../components/layout/PublicLayout';
import HeroSection from '../../components/sections/HeroSection';
import ChampionshipSection from '../../components/sections/ChampionshipSection';
import {
  FormatsSection, FacultySection, StudentsSection,
  RulesSection, GallerySection, WinnersSection,
  AboutSection, ContactSection, AnnouncementsBar,
} from '../../components/sections';
import { Tournament, FacultyCoordinator, StudentCoordinator, Rule, GalleryImage, Announcement } from '../../types';

export default function HomePage() {
  const { data: content = {} } = useQuery({
    queryKey: ['content'],
    queryFn: () => api.get('/content').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: tournaments = [], isLoading: tLoading } = useQuery<Tournament[]>({
    queryKey: ['tournaments-public'],
    queryFn: () => api.get('/tournaments/public').then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const { data: faculty = [], isLoading: fLoading } = useQuery<FacultyCoordinator[]>({
    queryKey: ['faculty'],
    queryFn: () => api.get('/faculty').then(r => r.data.data),
  });

  const { data: students = [], isLoading: sLoading } = useQuery<StudentCoordinator[]>({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then(r => r.data.data),
  });

  const { data: rules = [], isLoading: rLoading } = useQuery<Rule[]>({
    queryKey: ['rules'],
    queryFn: () => api.get('/rules').then(r => r.data.data),
  });

  const { data: gallery = [], isLoading: gLoading } = useQuery<GalleryImage[]>({
    queryKey: ['gallery'],
    queryFn: () => api.get('/gallery').then(r => r.data.data),
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements').then(r => r.data.data),
  });

  return (
    <PublicLayout>
      <AnnouncementsBar announcements={announcements} />
      <HeroSection content={content} />
      <ChampionshipSection tournaments={tournaments} isLoading={tLoading} />
      <FormatsSection />
      <FacultySection coordinators={faculty} isLoading={fLoading} />
      <StudentsSection coordinators={students} isLoading={sLoading} />
      <RulesSection rules={rules} isLoading={rLoading} />
      <GallerySection images={gallery} isLoading={gLoading} />
      <WinnersSection />
      <AboutSection content={content} />
      <ContactSection content={content} />
    </PublicLayout>
  );
}
