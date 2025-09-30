import PROJECT_REPORT from '../pages/project-report.jsx';
import LOGIN from '../pages/login.jsx';
import ADMIN_USERS from '../pages/admin-users.jsx';
import PROJECT_DATA-DASHBOARD from '../pages/project-data-dashboard.jsx';
import MYSQL_TEST from '../pages/mysql-test.jsx';
export const routers = [{
  id: "project-report",
  component: PROJECT_REPORT
}, {
  id: "login",
  component: LOGIN
}, {
  id: "admin-users",
  component: ADMIN_USERS
}, {
  id: "project-data-dashboard",
  component: PROJECT_DATA-DASHBOARD
}, {
  id: "mysql-test",
  component: MYSQL_TEST
}]