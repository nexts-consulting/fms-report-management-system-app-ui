'use client';

import { useRouter } from 'next/navigation';
import {
  Dashboard,
  Document,
  Location,
  CheckmarkOutline,
  Time,
  ArrowRight,
  CloudUpload,
  UserMultiple,
  AnalyticsCustom,
} from '@carbon/icons-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Document,
      title: 'Smart Reporting',
      description: 'Create, manage and submit field service reports efficiently',
    },
    {
      icon: Location,
      title: 'Location Tracking',
      description: 'Real-time GPS tracking and geofencing capabilities',
    },
    {
      icon: Time,
      title: 'Time Management',
      description: 'Check-in/out tracking with automated shift management',
    },
    {
      icon: CloudUpload,
      title: 'Cloud Storage',
      description: 'Secure cloud storage with Firebase integration',
    },
    {
      icon: UserMultiple,
      title: 'Team Collaboration',
      description: 'Coordinate with your team in real-time',
    },
    {
      icon: AnalyticsCustom,
      title: 'Analytics & Insights',
      description: 'Comprehensive reporting and data analytics',
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
    { value: '1000+', label: 'Active Users' },
    { value: '50+', label: 'Projects' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-10 via-white to-blue-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-60 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-20 bg-blue-10 px-4 py-2 text-sm font-medium text-blue-70"
            >
              <CheckmarkOutline size={16} />
              <span>Enterprise-Grade Field Management Solution</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-100 sm:text-6xl lg:text-7xl">
              Field Management
              <br />
              <span className="bg-gradient-to-r from-blue-60 to-cyan-50 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-8 text-gray-70 sm:text-xl">
              Streamline your field service operations with our comprehensive
              report management system. Track time, manage teams, and generate
              insights—all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Navigate to tenant/project selection or login
                  router.push('/login'); // Adjust based on your routing
                }}
                className="group flex w-full items-center justify-center gap-2 rounded-sm bg-blue-60 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-70 sm:w-auto"
              >
                Get Started
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-gray-30 bg-white px-8 py-4 text-base font-semibold text-gray-100 transition-all hover:border-gray-40 hover:bg-gray-10 sm:w-auto"
              >
                View Demo
              </motion.button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-60 sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="mb-4 text-base font-semibold uppercase tracking-wide text-blue-60">
              Features
            </h2>
            <p className="mb-16 text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
              Everything you need for field service management
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-sm border border-gray-20 bg-white p-8 shadow-sm transition-all hover:border-blue-20 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex rounded-sm bg-blue-10 p-3 text-blue-60 transition-colors group-hover:bg-blue-60 group-hover:text-white">
                  <feature.icon size={32} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-base leading-7 text-gray-60">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-60 to-cyan-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to streamline your field operations?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-10">
              Join hundreds of organizations already using our platform to
              manage their field service operations more efficiently.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                router.push('/login'); // Adjust based on your routing
              }}
              className="inline-flex items-center gap-2 rounded-sm bg-white px-8 py-4 text-base font-semibold text-blue-60 shadow-lg transition-all hover:bg-gray-10"
            >
              Select Tenant & Project
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center text-sm text-gray-10">
            <p className="mb-2 text-base font-semibold">
              FMS Report Management System
            </p>
            <p>© 2026 All rights reserved. Powered by IBM Design System</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
