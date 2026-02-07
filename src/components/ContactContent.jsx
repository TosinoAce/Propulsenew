import "./ContactContent.css";

const ContactContent = () => {
  return (
    <section className="contact-wrapper">
      <div className="contact-Head">
        <div className="contact-Head-first">
          <h2>Contact Us</h2>
          <p>
            Ready to find yourself a perfect hostel? Our dedicated team is here
            to assist you every step of the way. Whether you need a comfortable
            place to rent, need advice on the best locations or you have any
            questions, email, call or complete the form for quick response.
          </p>
          <div className="contact-card-container">
            <div className="contact-card">
              <img src="/contact-support.png" alt="" />
              <h3>Customer Support</h3>
              <p>
                Our support team is always available to address any concerns or
                queries you might have.
              </p>
            </div>
            <div className="contact-card">
              <img src="/feedback.png" alt="" />
              <h3>Feedback and Suggestions</h3>
              <p>
                Your feedback are very important to us as it would help us
                improve and shape the future of Propulse.
              </p>
            </div>
          </div>
        </div>
        <div className="contact-Head-second">
          <div className="GTF">
            <h2>Get in Touch</h2>
            <p>You can reach us anytime</p>
            <form>
              <input placeholder="Name" />
              <input placeholder="Email" />
              <input placeholder="Phone Number" />
              <textarea placeholder="Message"></textarea>
              <button>Submit</button>
            </form>
          </div>
        </div>
      </div>
      <div className="FAQ">
        <h3>Frequently Asked Questions</h3>
        <p className="questions">How do I book a hostel?</p>
        <p className="answers">
          Booking a hostel with ProPulse is easy. You can browse available
          options on our website, select your desired hostel, and complete the
          booking process online. For any assistance feel free to contact us
          directly.
        </p>
        <p className="questions">
          What amenities are included in the hostel rooms?
        </p>
        <p className="answers">
          Booking a hostel with ProPulse is easy. You can browse available
          options on our website, select your desired hostel, and complete the
          booking process online. For any assistance feel free to contact us
          directly.
        </p>
        <p className="questions">Can I cancel or modify my booking?</p>
        <p className="answers">
          Yes, you can cancel or modify your booking according to the hostel’s
          cancellation policy.Please review the terms and conditions provided
          during the booking process or contact our support team for assistance.
        </p>
      </div>
    </section>
  );
};

export default ContactContent;
