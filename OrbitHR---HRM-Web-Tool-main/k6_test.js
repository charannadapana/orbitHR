import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50 },  // Ramp up to 50 users
        { duration: '20s', target: 100 }, // Ramp up to 100 users
        { duration: '10s', target: 0 },   // Ramp down to 0 users
      ],
      gracefulRampDown: '5s',
    },
    performance_test: {
      executor: 'constant-vus',
      vus: 100,
      duration: '20s',
      startTime: '45s', // Start after load test
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

export default function () {
  const backendUrl = 'http://127.0.0.1:5000/';
  const frontendUrl = 'http://127.0.0.1:5173/';

  const resBackend = http.get(backendUrl);
  check(resBackend, {
    'backend status is 200': (r) => r.status === 200,
  });

  const resFrontend = http.get(frontendUrl);
  check(resFrontend, {
    'frontend status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
