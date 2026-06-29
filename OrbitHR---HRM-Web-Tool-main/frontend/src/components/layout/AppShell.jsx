import { motion } from 'framer-motion';
import AppLayout from './AppLayout';
import AppTopNav from './AppTopNav';
import { pageTransition } from '../../lib/motion';

const AppShell = ({ children, userRole = 'employee' }) => {
  return (
    <AppLayout>
      <div className="flex min-h-screen">
        <AppTopNav userRole={userRole} />
        <motion.main
          {...pageTransition}
          className="min-w-0 flex-1 px-4 pb-8 pt-24 sm:px-6 lg:ml-[300px] lg:px-8 lg:pt-10"
        >
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </motion.main>
      </div>
    </AppLayout>
  );
};

export default AppShell;
