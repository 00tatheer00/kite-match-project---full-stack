/* COMMENTED OUT - Membership and Largest Employer sections as requested */

// import { motion } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';

// const MembershipAchievements = () => {
//   const [ref, inView] = useInView({
//     triggerOnce: true,
//     threshold: 0.1
//   });

//   const memberships = [
//     'All Pakistan Textile Mills Association (APTMA)',
//     'The Federation of Pakistan Chambers of Commerce and Industry (FPCCI)',
//     'Sarhad Chamber of Commerce and Industry (SCCI)',
//     'Match Manufacturers Association'
//   ];

//   return (
//     <section ref={ref} className="py-16 md:py-24">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid md:grid-cols-2 gap-12">
//           {/* Membership Card */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             animate={inView ? { opacity: 1, x: 0 } : {}}
//             transition={{ duration: 0.8 }}
//             className="bg-gradient-to-br from-[#00AEEF] to-[#0095CC] text-white p-8 md:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
//           >
//             <h3 className="text-2xl md:text-3xl font-bold mb-6">Membership</h3>
//             <ul className="space-y-4">
//               {memberships.map((membership, index) => (
//                 <motion.li
//                   key={index}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={inView ? { opacity: 1, x: 0 } : {}}
//                   transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
//                   className="flex items-start"
//                 >
//                   <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                   <span>{membership}</span>
//                 </motion.li>
//               ))}
//             </ul>
//           </motion.div>

//           {/* Largest Employer Card */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={inView ? { opacity: 1, x: 0 } : {}}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="bg-gradient-to-br from-[#ED028C] to-[#FF8ACE] text-white p-8 md:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
//           >
//             <h3 className="text-2xl md:text-3xl font-bold mb-6">Largest Employer</h3>
//             <p className="mb-6 leading-relaxed">
//               The group is largely self-financed and has an impeccable record with the financial institutions of Pakistan with sales over USD 100 million. Exporting to Europe, Asia & Africa.
//             </p>
//             <p className="leading-relaxed">
//               We are one of the largest employers in the province of Khyber Pakhtunkhwa, with operational setup across 4 major cities of Pakistan: Lahore, Islamabad, Peshawar and Gadoon Swabi.
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default MembershipAchievements;

// Temporary empty component to avoid breaking imports
const MembershipAchievements = () => {
  return null;
};

export default MembershipAchievements;
