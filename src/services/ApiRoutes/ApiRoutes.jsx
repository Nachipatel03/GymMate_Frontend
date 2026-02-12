const apiRoutes = {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  Admin:"admin/", 
  Auth:"auth/",
  MemberRegister:"register/",
  Members:"members/",
  MemberDetail: (id) => `members/${id}/`, 
  Login :"login/",
  Plans:"membership-plans/",
  PlansDetails:(id) => `membership-plans/${id}/`, 
  Trainers: "byadmintrainers/",
  TrainerDetail: (id) => `trainers/${id}/`, 
};

export default apiRoutes;
