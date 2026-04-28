import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      {/* ambient background */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__grid" />
        <div className="hero__glow hero__glow--1" />
        <div className="hero__glow hero__glow--2" />
      </div>

      <div className="container hero__inner">
        <Reveal className="hero__copy">
          <span className="eyebrow">New · Algonix Coding Sheet 2.0</span>

          <h1>
            <span className="gradient-text">Code. Compete.</span>
            <br />
            <span className="brand-text">Win the future.</span>
          </h1>

          <p className="hero__sub">
            Algonix is a modern learning platform for developers — curated tutorials,
            an in-browser compiler, a 149-problem DSA sheet, and a community that
            ships. Free, forever.
          </p>

          <Reveal delay={120} className="hero__cta">
            <Link to="/sheet"     className="btn btn-primary">Start practicing →</Link>
            <Link to="/tutorials" className="btn btn-ghost">Watch tutorials</Link>
          </Reveal>

          <Reveal delay={220} className="hero__stats">
            <Stat value="149+"   label="Curated DSA problems" />
            <Stat value="4"      label="Languages covered" />
            <Stat value="100%"   label="Free, always" />
          </Reveal>
        </Reveal>

        <Reveal delay={180} className="hero__visual">
          <CodeMock />
        </Reveal>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="hero__stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function CodeMock() {
  return (
    <div className="codecard">
      <div className="codecard__chrome">
        <span /><span /><span />
        <em>algonix.java</em>
      </div>
      <pre className="codecard__body"><code>{`// Algonix · two-sum, optimized
import java.util.*;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> seen = new HashMap<>();
        for(int i=0; i<nums.length; i++){
            int need = target - nums[i];
            if(seen.containsKey(need)){
                return new int[]{ seen.get(need), i };
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`}</code></pre>
      <div className="codecard__footer">
        <span className="codecard__dot" /> Compiled in 38 ms · 0 errors
      </div>
    </div>
  );
}
